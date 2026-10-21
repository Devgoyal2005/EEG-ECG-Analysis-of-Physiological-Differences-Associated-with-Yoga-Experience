from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from scipy.stats import skew, kurtosis, entropy
from utils.config import FREQ_BANDS

def compute_spectral_entropy(psd: np.ndarray) -> float:
    """Computes normalized spectral entropy from PSD."""
    psd_norm = psd / (np.sum(psd) + 1e-12)
    psd_norm = psd_norm[psd_norm > 0]
    if len(psd_norm) == 0:
        return 0.0
    h = -np.sum(psd_norm * np.log2(psd_norm))
    max_h = np.log2(len(psd_norm)) if len(psd_norm) > 1 else 1.0
    return float(h / max_h)


def extract_features_from_epochs(
    epochs: List[Dict[str, Any]], 
    subject_id: str, 
    group: str  # "expert" or "control"
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Extracts 4 distinct representation matrices from segmented epochs:
    1. eeg_features_df
    2. ecg_features_df
    3. combined_features_df
    4. interaction_features_df
    """
    eeg_rows = []
    ecg_rows = []
    interaction_rows = []
    
    for ep in epochs:
        state = ep["state"]
        band_pwrs = ep["band_powers"]
        hrv = ep["hrv_metrics"]
        
        # --- 1. EEG Features ---
        eeg_feat = {
            "subject_id": subject_id,
            "group": group,
            "label": 1 if group == "expert" else 0,
            "state": state,
        }
        
        # Aggregate band powers across channels (mean, std)
        for band in ["delta", "theta", "alpha", "beta", "gamma"]:
            abs_pwr = band_pwrs.get(f"{band}_abs", np.zeros(1))
            rel_pwr = band_pwrs.get(f"{band}_rel", np.zeros(1))
            
            eeg_feat[f"eeg_{band}_abs_mean"] = float(np.mean(abs_pwr))
            eeg_feat[f"eeg_{band}_abs_std"] = float(np.std(abs_pwr))
            eeg_feat[f"eeg_{band}_rel_mean"] = float(np.mean(rel_pwr))
            
        # Ratios (Theta/Beta, Theta/Alpha)
        theta_m = eeg_feat.get("eeg_theta_rel_mean", 1.0)
        beta_m = eeg_feat.get("eeg_beta_rel_mean", 1.0)
        alpha_m = eeg_feat.get("eeg_alpha_rel_mean", 1.0)
        
        eeg_feat["eeg_theta_beta_ratio"] = float(theta_m / (beta_m + 1e-6))
        eeg_feat["eeg_theta_alpha_ratio"] = float(theta_m / (alpha_m + 1e-6))
        
        # --- 2. ECG Features ---
        ecg_feat = {
            "subject_id": subject_id,
            "group": group,
            "label": 1 if group == "expert" else 0,
            "state": state,
            "ecg_mean_hr": float(hrv.get("mean_hr", 70.0)),
            "ecg_sdnn": float(hrv.get("sdnn", 50.0)),
            "ecg_rmssd": float(hrv.get("rmssd", 40.0)),
            "ecg_pnn50": float(hrv.get("pnn50", 15.0)),
            "ecg_lf": float(hrv.get("lf", 500.0)),
            "ecg_hf": float(hrv.get("hf", 400.0)),
            "ecg_lf_hf_ratio": float(hrv.get("lf_hf_ratio", 1.25)),
        }
        
        # --- 3. Brain-Heart Coupling / Interaction Features ---
        # Frontal alpha vs HRV RMSSD coupling metric
        coupling_feat = {
            "coupling_alpha_rmssd_prod": float(eeg_feat["eeg_alpha_rel_mean"] * ecg_feat["ecg_rmssd"]),
            "coupling_theta_lf_ratio": float(eeg_feat["eeg_theta_rel_mean"] / (ecg_feat["ecg_lf_hf_ratio"] + 1e-6)),
            "coupling_neuro_cardiac_index": float((eeg_feat["eeg_alpha_rel_mean"] * 100) / (ecg_feat["ecg_mean_hr"] + 1e-6))
        }
        
        eeg_rows.append(eeg_feat)
        ecg_rows.append(ecg_feat)
        interaction_rows.append(coupling_feat)
        
    df_eeg = pd.DataFrame(eeg_rows)
    df_ecg = pd.DataFrame(ecg_rows)
    df_interaction = pd.DataFrame(interaction_rows)
    
    # Combined = EEG + ECG (drop duplicate metadata cols)
    meta_cols = ["subject_id", "group", "label", "state"]
    df_combined = pd.concat([df_eeg, df_ecg.drop(columns=meta_cols, errors="ignore")], axis=1)
    
    # Interaction = Combined + Brain-Heart coupling metrics
    df_all_interaction = pd.concat([df_combined, df_interaction], axis=1)
    
    return df_eeg, df_ecg, df_combined, df_all_interaction
