from typing import Optional, Tuple, List, Any
import numpy as np
from utils.config import EEG_LOW_FREQ, EEG_HIGH_FREQ, NOTCH_FREQ

try:
    import mne
    from mne.preprocessing import ICA
except ImportError:
    mne = None
    ICA = None


def preprocess_eeg(
    raw,
    l_freq: float = EEG_LOW_FREQ,
    h_freq: float = EEG_HIGH_FREQ,
    notch_freq: float = NOTCH_FREQ,
    run_ica: bool = True,
    n_ica_components: int = 15,
    random_state: int = 42
) -> Tuple[Any, Optional[Any]]:
    """
    Standard preprocessing pipeline for EEG signals:
    1. Channel type verification and average re-referencing
    2. Bandpass filtering (1 - 40 Hz)
    3. Notch filtering at 50 Hz
    4. Independent Component Analysis (ICA) for eye-blink / muscle artifact rejection
    """
    if mne is None:
        raise ImportError("mne is not installed. Run `pip install mne`.")
        
    # Copy raw to avoid mutating original (lazy copy when preload=False)
    raw_proc = raw.copy()
    
    # Pick EEG channels
    eeg_picks = mne.pick_types(raw_proc.info, eeg=True, meg=False, eog=False, ecg=False)
    if len(eeg_picks) == 0:
        raise ValueError("No EEG channels found in recording!")
        
    # Set average reference as a projection (works without loading all data into RAM)
    # projection=True adds a proj vector; it is applied lazily during filtering / ICA
    mne.set_eeg_reference(raw_proc, ref_channels='average', projection=True, verbose=False)
    raw_proc.apply_proj()
    
    # 1. Bandpass filter — MNE streams data in chunks when preload=False
    raw_proc.filter(
        l_freq=l_freq, 
        h_freq=h_freq, 
        picks=eeg_picks, 
        fir_design='firwin', 
        verbose=False
    )
    
    # 2. Notch filter (powerline)
    if notch_freq is not None:
        # Check if notch frequency is within Nyquist and passband
        nyquist = raw_proc.info['sfreq'] / 2.0
        if notch_freq < nyquist and notch_freq <= h_freq:
            raw_proc.notch_filter(
                freqs=notch_freq, 
                picks=eeg_picks, 
                fir_design='firwin', 
                verbose=False
            )
            
    # 3. ICA Artifact Rejection
    # ICA requires data in memory — load only EEG picks into RAM for fitting
    ica = None
    if run_ica and ICA is not None:
        try:
            # Load EEG picks into RAM (other channels stay on disk)
            raw_proc.load_data(verbose=False)
            
            # Fit ICA on EEG channels
            n_components = min(n_ica_components, len(eeg_picks) - 1)
            ica = ICA(n_components=n_components, random_state=random_state, max_iter=200, verbose=False)
            ica.fit(raw_proc, picks=eeg_picks, verbose=False)
            
            # Find EOG/blinks or high-variance components if EOG/Fp1/Fp2 channels exist
            eog_chs = [ch for ch in raw_proc.ch_names if ch.lower() in ['fp1', 'fp2', 'fpz', 'eog']]
            if eog_chs:
                eog_indices, _ = ica.find_bads_eog(raw_proc, ch_name=eog_chs[0], threshold=2.5, verbose=False)
                if eog_indices:
                    ica.exclude = eog_indices
            
            # Apply ICA
            raw_proc = ica.apply(raw_proc, verbose=False)
        except MemoryError:
            print("Warning: ICA skipped — insufficient RAM for full session. Continuing without ICA.")
            ica = None
        except Exception as e:
            print(f"Warning: ICA fitting skipped or encountered warning: {e}")
            
    return raw_proc, ica


def compute_band_powers(
    epoch_data: np.ndarray, 
    sfreq: float, 
    freq_bands: dict
) -> dict:
    """
    Computes absolute and relative spectral power in specified frequency bands using Welch's method.
    epoch_data shape: (n_channels, n_samples)
    """
    from scipy.signal import welch
    
    n_channels, n_samples = epoch_data.shape
    nperseg = min(int(sfreq * 2), n_samples)
    
    freqs, psd = welch(epoch_data, fs=sfreq, nperseg=nperseg, axis=-1)
    # psd shape: (n_channels, len(freqs))
    
    band_powers = {}
    total_power = np.sum(psd, axis=-1) + 1e-12
    
    for band_name, (low, high) in freq_bands.items():
        idx_band = np.logical_and(freqs >= low, freqs <= high)
        if np.any(idx_band):
            abs_power = np.mean(psd[:, idx_band], axis=-1)  # mean over freq bin
            rel_power = abs_power / total_power
            band_powers[f"{band_name}_abs"] = abs_power
            band_powers[f"{band_name}_rel"] = rel_power
        else:
            band_powers[f"{band_name}_abs"] = np.zeros(n_channels)
            band_powers[f"{band_name}_rel"] = np.zeros(n_channels)
            
    return band_powers
