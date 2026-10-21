from typing import List, Dict, Any
import numpy as np
import pandas as pd
from utils.config import COGNITIVE_STATES, FREQ_BANDS
from pipeline.eeg_preprocessor import compute_band_powers
from pipeline.ecg_preprocessor import preprocess_ecg

try:
    import mne
except ImportError:
    mne = None

# Maximum seconds loaded into RAM at once when processing large recordings.
# 5-minute window → ~300 MB for 64ch × 500Hz × 300s × 8 bytes (float64)
_CHUNK_SEC = 300


def _preprocess_crop(raw_crop, l_freq: float = 1.0, h_freq: float = 40.0, notch_freq: float = 50.0):
    """
    Filters a short, already-loaded (preloaded) crop in-place.
    ICA is skipped here — it runs once per full recording in preprocess_eeg()
    when called individually; batch pipeline skips ICA for speed.
    """
    eeg_picks = mne.pick_types(raw_crop.info, eeg=True, meg=False, ecg=False)
    if len(eeg_picks) == 0:
        return raw_crop

    # Average reference via projection (no extra full-data RAM allocation)
    mne.set_eeg_reference(raw_crop, ref_channels='average', projection=True, verbose=False)
    raw_crop.apply_proj()

    # Bandpass filter — works because crop is already loaded
    raw_crop.filter(l_freq=l_freq, h_freq=h_freq, picks=eeg_picks, fir_design='firwin', verbose=False)

    # Notch filter for power-line interference
    nyquist = raw_crop.info['sfreq'] / 2.0
    if notch_freq is not None and notch_freq < nyquist:
        raw_crop.notch_filter(freqs=notch_freq, picks=eeg_picks, fir_design='firwin', verbose=False)

    return raw_crop


def segment_epochs_by_state(
    raw,
    ecg_ch_name: str = "ECG",
    epoch_duration_sec: float = 10.0,
    overlap: float = 0.5
) -> List[Dict[str, Any]]:
    """
    Segments continuous EEG and ECG signals into synchronized time-windowed epochs
    labelled by the active cognitive state.

    Memory strategy:
    - The full recording is NOT loaded into RAM all at once.
    - Instead, it is processed in _CHUNK_SEC-second windows (default 5 min).
    - Each crop is loaded (~300 MB), filtered, epochs extracted, then deleted.
    - Peak RAM usage stays bounded regardless of recording length.
    """
    sfreq = raw.info['sfreq']
    samples_per_epoch = int(epoch_duration_sec * sfreq)
    step_samples = int(samples_per_epoch * (1.0 - overlap))
    total_duration_sec = raw.n_times / sfreq

    eeg_picks = mne.pick_types(raw.info, eeg=True, meg=False, ecg=False)
    has_ecg = ecg_ch_name in raw.ch_names

    epochs_dataset = []

    # Build list of (start_sec, end_sec, state_label) from annotations
    annots = raw.annotations
    state_windows = []

    if annots is not None and len(annots) > 0:
        n_annots = len(annots)
        has_durations = any(annots.duration[i] > 1.0 for i in range(n_annots))
        
        if has_durations:
            for i in range(n_annots):
                if annots.duration[i] < 1.0:
                    continue
                start_s = annots.onset[i]
                end_s = min(start_s + annots.duration[i], total_duration_sec)
                desc = annots.description[i].lower()
                state = "resting" if "rest" in desc else "mind_wandering"
                for key in COGNITIVE_STATES.keys():
                    if key in desc:
                        state = key
                        break
                state_windows.append((start_s, end_s, state))
        else:
            # Parse BIDS stimulus triggers with START and END pairs
            for i in range(n_annots):
                desc_u = annots.description[i].upper()
                onset = annots.onset[i]

                if "OPEN_EYES_START" in desc_u or "CLOSE_EYES_START" in desc_u:
                    end_t = min(onset + 60.0, total_duration_sec)
                    for j in range(i + 1, n_annots):
                        if "OPEN_EYES_END" in annots.description[j].upper() or "CLOSE_EYES_END" in annots.description[j].upper():
                            end_t = annots.onset[j]
                            break
                    if end_t > onset:
                        state_windows.append((onset, end_t, "resting"))

                elif "INTERNAL_CONCENTRATION_START" in desc_u:
                    end_t = min(onset + 900.0, total_duration_sec)
                    for j in range(i + 1, n_annots):
                        if "INTERNAL_CONCENTRATION_END" in annots.description[j].upper():
                            end_t = annots.onset[j]
                            break
                    if end_t > onset:
                        state_windows.append((onset, end_t, "internal_concentration"))

                elif "EXTERNAL_CONCENTRATION" in desc_u and "START" in desc_u:
                    end_t = min(onset + 120.0, total_duration_sec)
                    for j in range(i + 1, n_annots):
                        if "EXTERNAL_CONCENTRATION" in annots.description[j].upper() and "END" in annots.description[j].upper():
                            end_t = annots.onset[j]
                            break
                    if end_t > onset:
                        state_windows.append((onset, end_t, "external_concentration"))

                elif "MIND_WANDERING_END" in desc_u:
                    prev_t = 0.0
                    for j in range(i - 1, -1, -1):
                        if "CLOSE_EYES_END" in annots.description[j].upper():
                            prev_t = annots.onset[j]
                            break
                    if onset > prev_t:
                        state_windows.append((prev_t, onset, "mind_wandering"))

    if not state_windows:
        # Fallback if no annotated triggers matched: split recording evenly into 4 segments
        seg = total_duration_sec / 4.0
        state_keys = list(COGNITIVE_STATES.keys())
        for i, key in enumerate(state_keys):
            state_windows.append((i * seg, (i + 1) * seg, key))

    # --- Chunked processing loop ---
    chunk_sec = min(_CHUNK_SEC, total_duration_sec)
    chunk_start = 0.0

    while chunk_start < total_duration_sec:
        chunk_end = min(chunk_start + chunk_sec, total_duration_sec)

        # Only process chunks that overlap with at least one state window
        relevant = [
            (max(sw[0], chunk_start), min(sw[1], chunk_end), sw[2])
            for sw in state_windows
            if sw[0] < chunk_end and sw[1] > chunk_start
        ]
        if not relevant:
            chunk_start += chunk_sec
            continue

        # Crop this time window from the memory-mapped file and load into RAM
        tmax = chunk_end - 1.0 / sfreq  # tmax is inclusive in MNE
        raw_crop = raw.copy().crop(tmin=chunk_start, tmax=tmax)
        raw_crop.load_data(verbose=False)  # loads only this crop (~300 MB)

        # Apply bandpass + notch filter to the crop
        _preprocess_crop(raw_crop)

        # Extract epochs from relevant state windows within this crop
        for (sw_start, sw_end, state) in relevant:
            # Convert absolute seconds → crop-relative sample indices
            rel_start = sw_start - chunk_start
            rel_end = sw_end - chunk_start
            start_samp = int(rel_start * sfreq)
            end_samp = min(int(rel_end * sfreq), raw_crop.n_times)

            curr = start_samp
            while curr + samples_per_epoch <= end_samp:
                stop = curr + samples_per_epoch

                # Slice from already-loaded crop (no I/O, just NumPy indexing)
                eeg_chunk = raw_crop.get_data(picks=eeg_picks, start=curr, stop=stop)
                if has_ecg:
                    ecg_chunk = raw_crop.get_data(picks=[ecg_ch_name], start=curr, stop=stop)[0]
                else:
                    ecg_chunk = np.zeros(samples_per_epoch)

                band_pwrs = compute_band_powers(eeg_chunk, sfreq, FREQ_BANDS)
                _, _, hrv_metrics = preprocess_ecg(ecg_chunk, sfreq)

                epochs_dataset.append({
                    "start_time_sec": chunk_start + curr / sfreq,
                    "state": state,
                    "state_name": COGNITIVE_STATES.get(state, state),
                    "band_powers": band_pwrs,
                    "hrv_metrics": hrv_metrics,
                    "n_eeg_channels": len(eeg_picks)
                })
                curr += step_samples

        # Explicitly free the crop from RAM before the next iteration
        del raw_crop
        chunk_start += chunk_sec

    return epochs_dataset
