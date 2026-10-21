import os
import shutil
import time
import socket
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from utils.config import RAW_DATA_DIR, HF_DATASET_REPO, HF_TOKEN

try:
    import mne
except ImportError:
    mne = None

try:
    from huggingface_hub import HfApi
except ImportError:
    HfApi = None

# Global live download status tracker
download_status: Dict[str, Any] = {
    "is_downloading": False,
    "current_file": None,
    "current_subject": None,
    "completed_files": 0,
    "total_files": 0,
    "progress_pct": 0,
    "downloaded_bytes_mb": 0.0,
    "speed_mb_s": 0.0,
    "message": "Ready to download or sync dataset",
    "error": None,
    "cancel_requested": False
}


def get_download_status() -> Dict[str, Any]:
    """Returns the current status of the background dataset downloader."""
    global download_status
    return dict(download_status)


def cancel_download():
    """Requests cancellation of an ongoing download."""
    global download_status
    if download_status["is_downloading"]:
        download_status["cancel_requested"] = True
        download_status["message"] = "Cancelling download..."


def _create_resilient_session() -> requests.Session:
    """Creates a requests Session with automatic retry and backoff adapters."""
    session = requests.Session()
    retries = Retry(
        total=5,
        connect=5,
        read=5,
        backoff_factor=1.5,
        status_forcelist=[429, 500, 502, 503, 504],
        raise_on_status=False
    )
    adapter = HTTPAdapter(max_retries=retries, pool_connections=5, pool_maxsize=5)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def _download_file_resumable(
    url: str,
    dest_path: Path,
    expected_size: Optional[int],
    auth_token: Optional[str]
) -> bool:
    """
    Downloads a single file with true HTTP Range resume capability.
    - If dest_path exists with expected_size: skips immediately (0 ms).
    - If .part exists: resumes from existing bytes (Range: bytes={N}-).
    - On connection reset or RemoteDisconnected: retries and continues from current offset.
    - Atomically renames .part -> dest_path upon completion.
    """
    global download_status
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    part_path = dest_path.with_name(dest_path.name + ".part")

    # 1. Fast check: is destination file already complete?
    if dest_path.exists():
        actual_size = dest_path.stat().st_size
        if expected_size is None or actual_size == expected_size:
            return True
        if actual_size > expected_size:
            dest_path.unlink()

    # 2. Check if .part file already completed previously
    if part_path.exists():
        part_size = part_path.stat().st_size
        if expected_size is not None:
            if part_size == expected_size:
                if dest_path.exists():
                    dest_path.unlink()
                part_path.rename(dest_path)
                return True
            elif part_size > expected_size:
                part_path.unlink()

    # 3. Download / Resume loop
    max_retries = 10
    chunk_size = 1024 * 1024  # 1 MB chunks
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    last_error = None
    for attempt in range(1, max_retries + 1):
        if download_status["cancel_requested"]:
            return False

        try:
            req_headers = dict(headers)
            existing_bytes = part_path.stat().st_size if part_path.exists() else 0
            if existing_bytes > 0:
                req_headers["Range"] = f"bytes={existing_bytes}-"

            session = _create_resilient_session()
            with session.get(url, headers=req_headers, stream=True, timeout=(20, 90)) as resp:
                if resp.status_code == 416:
                    # Range not satisfiable -> file already fully downloaded in .part
                    if dest_path.exists():
                        dest_path.unlink()
                    part_path.rename(dest_path)
                    return True

                if resp.status_code not in (200, 206):
                    resp.raise_for_status()

                # Determine file write mode
                mode = "ab" if (existing_bytes > 0 and resp.status_code == 206) else "wb"
                if mode == "wb" and existing_bytes > 0 and resp.status_code == 200:
                    # Server did not accept Range request, must restart this file
                    existing_bytes = 0

                t_start = time.time()
                bytes_this_attempt = 0

                with open(part_path, mode) as f:
                    for chunk in resp.iter_content(chunk_size=chunk_size):
                        if download_status["cancel_requested"]:
                            return False
                        if chunk:
                            f.write(chunk)
                            existing_bytes += len(chunk)
                            bytes_this_attempt += len(chunk)

                            # Calculate transfer speed
                            elapsed = time.time() - t_start
                            speed = (bytes_this_attempt / (1024 * 1024)) / max(elapsed, 0.1)
                            download_status["speed_mb_s"] = round(speed, 2)
                            download_status["downloaded_bytes_mb"] = round(existing_bytes / (1024 * 1024), 1)

            # Verification upon stream finish
            final_size = part_path.stat().st_size
            if expected_size is None or final_size == expected_size:
                if dest_path.exists():
                    dest_path.unlink()
                part_path.rename(dest_path)
                return True
            else:
                last_error = f"Size mismatch: got {final_size}, expected {expected_size}"

        except Exception as e:
            last_error = str(e)
            current_bytes = part_path.stat().st_size if part_path.exists() else 0
            download_status["message"] = (
                f"Connection dropped at {round(current_bytes / (1024*1024), 1)} MB. "
                f"Resuming (attempt {attempt}/{max_retries})..."
            )
            time.sleep(min(3 * attempt, 20))

    if last_error:
        print(f"Warning: Failed downloading {dest_path.name} after {max_retries} attempts: {last_error}")
        return False
    return True


def download_hf_dataset(
    repo_id: str = HF_DATASET_REPO, 
    local_dir: Optional[Path] = None, 
    max_subjects: Optional[int] = None,
    allow_patterns: Optional[List[str]] = None,
    token: Optional[str] = None,
    metadata_only: bool = False
) -> Path:
    """
    Resumable Hugging Face dataset downloader.
    - Skips already complete files on disk in 0 ms.
    - Resumes interrupted downloads using HTTP Range requests from the exact byte where it paused.
    - Prioritizes tiny metadata & header files first (.tsv, .json, .vhdr, .vmrk).
    - Protects local disk space by pausing if free space drops below 2.0 GB.
    - Updates download_status in real-time for live frontend UI monitoring.
    """
    global download_status

    if download_status["is_downloading"]:
        print("Download is already running in background.")
        return local_dir or RAW_DATA_DIR

    target_dir = local_dir or RAW_DATA_DIR
    target_dir.mkdir(parents=True, exist_ok=True)
    auth_token = token or HF_TOKEN

    if HfApi is None:
        raise ImportError("huggingface_hub is not installed. Run `pip install huggingface_hub`.")

    download_status["is_downloading"] = True
    download_status["cancel_requested"] = False
    download_status["error"] = None
    download_status["message"] = f"Connecting to Hugging Face repository {repo_id}..."
    download_status["progress_pct"] = 0

    try:
        api = HfApi(token=auth_token)
        tree = list(api.list_repo_tree(repo_id=repo_id, repo_type="dataset", recursive=True))
        all_items = [it for it in tree if hasattr(it, "size") and it.size is not None]

        # Extract all participant subject IDs
        all_subjects = sorted(list(set(
            it.path.split("/")[0] for it in all_items if it.path.startswith("sub-")
        )))

        # Apply subject limit if requested
        selected_subjects = set(all_subjects[:max_subjects]) if max_subjects else set(all_subjects)

        # STRICT WHITELIST of physiological and metadata file types
        # Explicitly excludes .mp4 video recordings and heavy media
        ALLOWED_EXTENSIONS = {".vhdr", ".vmrk", ".eeg", ".tsv", ".json", ".csv", ".txt", ".md"}

        def should_include(item_path: str) -> bool:
            p_lower = item_path.lower()
            # 1. Strictly block all video files (.mp4, .avi, etc.)
            if p_lower.endswith((".mp4", ".avi", ".mkv", ".mov", ".wmv", ".webm", ".wav", ".mp3")):
                return False
            
            # 2. Check allowed extension
            ext = Path(item_path).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                return False

            # 3. Subject-level filtering if max_subjects is set
            parts = item_path.split("/")
            if parts[0].startswith("sub-"):
                if parts[0] not in selected_subjects:
                    return False

            # 4. If metadata_only requested, skip .eeg binary
            if metadata_only and item_path.endswith(".eeg"):
                return False

            return True

        target_items = [it for it in all_items if should_include(it.path)]

        # Separate items into metadata (tiny, priority 1) and raw signal (.eeg, priority 2)
        meta_items = [it for it in target_items if not it.path.endswith(".eeg")]
        eeg_items = [it for it in target_items if it.path.endswith(".eeg")]
        ordered_items = meta_items + eeg_items

        download_status["total_files"] = len(ordered_items)
        download_status["completed_files"] = 0

        base_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main"

        for idx, item in enumerate(ordered_items):
            if download_status["cancel_requested"]:
                download_status["message"] = "Download cancelled by user."
                break

            dest_path = target_dir / item.path
            file_url = f"{base_url}/{item.path}"

            # Subject identifier
            sub_id = item.path.split("/")[0] if item.path.startswith("sub-") else "Metadata"
            download_status["current_file"] = dest_path.name
            download_status["current_subject"] = sub_id

            # Safety check: disk space before large files
            if item.path.endswith(".eeg"):
                try:
                    _, _, free_bytes = shutil.disk_usage(str(target_dir))
                    if free_bytes < 2 * 1024 * 1024 * 1024:  # Less than 2 GB free
                        download_status["message"] = "Download safely paused: Low disk space (<2 GB free on drive)."
                        break
                except Exception:
                    pass

            is_eeg = item.path.endswith(".eeg")
            size_mb = round(item.size / (1024 * 1024), 1)

            # Check if file is already fully downloaded
            if dest_path.exists() and dest_path.stat().st_size == item.size:
                download_status["completed_files"] = idx + 1
                download_status["progress_pct"] = int(((idx + 1) / max(1, len(ordered_items))) * 100)
                download_status["message"] = f"Skipping {dest_path.name} (already downloaded, {size_mb} MB)"
                continue

            # Active download
            download_status["message"] = f"Downloading {sub_id} / {dest_path.name} ({size_mb} MB)..."
            success = _download_file_resumable(
                url=file_url,
                dest_path=dest_path,
                expected_size=item.size,
                auth_token=auth_token
            )

            if success:
                download_status["completed_files"] = idx + 1
                download_status["progress_pct"] = int(((idx + 1) / max(1, len(ordered_items))) * 100)

        if not download_status["cancel_requested"]:
            download_status["progress_pct"] = 100
            download_status["message"] = "Dataset synchronization complete! All requested files ready on disk."

    except Exception as e:
        download_status["error"] = str(e)
        download_status["message"] = f"Download error: {str(e)}"
        print("Download exception:", e)
    finally:
        download_status["is_downloading"] = False
        download_status["speed_mb_s"] = 0.0

    return target_dir


def find_brainvision_recordings(directory: Path = RAW_DATA_DIR) -> List[Path]:
    """Scans directory recursively for BrainVision header (.vhdr) files."""
    return list(directory.glob("**/*.vhdr"))


def load_brainvision_recording(
    vhdr_path: Path, 
    preload: bool = False
) -> Tuple[Any, Optional[str]]:
    """
    Loads a BrainVision raw recording using MNE-Python.
    Identifies and configures the ECG channel if present.
    """
    if mne is None:
        raise ImportError("mne is not installed. Run `pip install mne`.")
    
    raw = mne.io.read_raw_brainvision(str(vhdr_path), preload=preload, verbose=False)
    
    # Auto-detect ECG auxiliary channel
    ecg_ch_name = None
    for ch in raw.ch_names:
        ch_lower = ch.lower()
        if "ecg" in ch_lower or "ekg" in ch_lower or "aux" in ch_lower or "bip" in ch_lower:
            raw.set_channel_types({ch: "ecg"})
            ecg_ch_name = ch
            break
            
    return raw, ecg_ch_name


def parse_annotations_and_events(raw) -> pd.DataFrame:
    """Extracts annotations/markers from BrainVision MNE Raw instance."""
    if raw.annotations is None or len(raw.annotations) == 0:
        return pd.DataFrame(columns=["onset", "duration", "description"])
    
    df = pd.DataFrame({
        "onset": raw.annotations.onset,
        "duration": raw.annotations.duration,
        "description": raw.annotations.description
    })
    return df


def generate_synthetic_subject_data(
    subject_id: str,
    group: str = "expert",
    duration_sec: int = 120,
    sfreq: int = 500,
    target_dir: Path = RAW_DATA_DIR
) -> Path:
    """Generates a synthetic BrainVision recording (.vhdr, .vmrk, .eeg) for testing."""
    if mne is None:
        raise ImportError("mne is not installed. Run `pip install mne`.")
        
    n_samples = duration_sec * sfreq
    times = np.arange(n_samples) / sfreq
    
    eeg_channels = [
        "Fp1", "Fpz", "Fp2", "F7", "F3", "Fz", "F4", "F8",
        "FC5", "FC1", "FC2", "FC6", "M1", "T7", "C3", "Cz",
        "C4", "T8", "M2", "CP5", "CP1", "CP2", "CP6", "P7",
        "P3", "Pz", "P4", "P8", "POz", "O1", "Oz", "O2",
        "AF7", "AF3", "AF4", "AF8", "F5", "F1", "F2", "F6",
        "FT9", "FT7", "FC3", "FC4", "FT8", "FT10", "C5", "C1",
        "C2", "C6", "TP7", "CP3", "CPz", "CP4", "TP8", "P5",
        "P1", "P2", "P6", "PO7", "PO3", "PO4", "PO8", "Iz"
    ]
    
    alpha_amp = 1.5e-5 if group == "expert" else 0.8e-5
    theta_amp = 1.2e-5 if group == "expert" else 0.7e-5
    
    np.random.seed(abs(hash(subject_id)) % (2**31))
    eeg_data = np.random.randn(len(eeg_channels), n_samples) * 0.5e-5
    
    for i in range(len(eeg_channels)):
        eeg_data[i] += alpha_amp * np.sin(2 * np.pi * 10.0 * times + (i * 0.1))
        eeg_data[i] += theta_amp * np.sin(2 * np.pi * 6.0 * times)
        
    heart_rate_bpm = 60 if group == "expert" else 72
    rr_interval = 60.0 / heart_rate_bpm
    ecg_signal = np.random.randn(n_samples) * 0.05
    
    beat_times = np.arange(0.5, duration_sec - 0.5, rr_interval)
    for bt in beat_times:
        idx = int(bt * sfreq)
        if 0 <= idx < n_samples:
            w = int(0.04 * sfreq)
            start = max(0, idx - w)
            end = min(n_samples, idx + w)
            t_win = np.linspace(-1, 1, end - start)
            ecg_signal[start:end] += 1.5 * np.exp(-15 * (t_win**2))
            
    all_ch_names = eeg_channels + ["ECG"]
    all_ch_types = ["eeg"] * len(eeg_channels) + ["ecg"]
    all_data = np.vstack([eeg_data, ecg_signal * 1e-3])
    
    info = mne.create_info(ch_names=all_ch_names, sfreq=sfreq, ch_types=all_ch_types)
    raw = mne.io.RawArray(all_data, info, verbose=False)
    
    states = ["resting", "internal_concentration", "external_concentration", "mind_wandering"]
    seg_duration = duration_sec / 4.0
    onsets = [i * seg_duration for i in range(4)]
    durations = [seg_duration] * 4
    descriptions = [f"State/{s}" for s in states]
    
    annot = mne.Annotations(onset=onsets, duration=durations, description=descriptions)
    raw.set_annotations(annot)
    
    subj_dir = target_dir / subject_id
    subj_dir.mkdir(parents=True, exist_ok=True)
    vhdr_file = subj_dir / f"{subject_id}.vhdr"
    
    mne.export.export_raw(str(vhdr_file), raw, fmt="brainvision", overwrite=True, verbose=False)
    print(f"Created synthetic BrainVision subject at {vhdr_file}")
    return vhdr_file
