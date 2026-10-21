from typing import Dict, Any, List
import numpy as np
import pandas as pd
from scipy.stats import ttest_ind, mannwhitneyu, f_oneway

def compute_cohens_d(group1: np.ndarray, group2: np.ndarray) -> float:
    """Computes Cohen's d effect size between two independent groups."""
    n1, n2 = len(group1), len(group2)
    if n1 < 2 or n2 < 2:
        return 0.0
    s1, s2 = np.var(group1, ddof=1), np.var(group2, ddof=1)
    pooled_sd = np.sqrt(((n1 - 1) * s1 + (n2 - 1) * s2) / (n1 + n2 - 2))
    if pooled_sd == 0:
        return 0.0
    return float((np.mean(group1) - np.mean(group2)) / pooled_sd)


def analyze_expert_vs_control_differences(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Computes statistical comparisons (Mean ± SD, t-test, Mann-Whitney U, Cohen's d)
    between Yoga Experts and Controls across all physiological features.
    """
    meta_cols = ["subject_id", "group", "label", "state"]
    feature_cols = [c for c in df.columns if c not in meta_cols]
    
    expert_df = df[df["group"] == "expert"]
    control_df = df[df["group"] == "control"]
    
    results = []
    for col in feature_cols:
        exp_vals = expert_df[col].dropna().values
        ctrl_vals = control_df[col].dropna().values
        
        if len(exp_vals) == 0 or len(ctrl_vals) == 0:
            continue
            
        exp_mean = float(np.mean(exp_vals))
        exp_sd = float(np.std(exp_vals))
        ctrl_mean = float(np.mean(ctrl_vals))
        ctrl_sd = float(np.std(ctrl_vals))
        
        # t-test
        try:
            t_stat, p_val = ttest_ind(exp_vals, ctrl_vals, equal_var=False)
            t_stat = round(float(t_stat), 3)
            p_val = round(float(p_val), 4)
        except Exception:
            t_stat, p_val = 0.0, 1.0
            
        d_effect = round(compute_cohens_d(exp_vals, ctrl_vals), 3)
        
        # Significance marker
        sig = "ns"
        if p_val < 0.001:
            sig = "***"
        elif p_val < 0.01:
            sig = "**"
        elif p_val < 0.05:
            sig = "*"
            
        # Modality tag
        if col.startswith("eeg"):
            modality = "EEG"
        elif col.startswith("ecg"):
            modality = "ECG"
        else:
            modality = "Coupling"
            
        results.append({
            "feature": col,
            "modality": modality,
            "expert_mean": round(exp_mean, 4),
            "expert_sd": round(exp_sd, 4),
            "control_mean": round(ctrl_mean, 4),
            "control_sd": round(ctrl_sd, 4),
            "difference": round(exp_mean - ctrl_mean, 4),
            "t_statistic": t_stat,
            "p_value": p_val,
            "cohens_d": d_effect,
            "significance": sig
        })
        
    # Sort by absolute effect size
    results = sorted(results, key=lambda x: abs(x["cohens_d"]), reverse=True)
    return results


def analyze_states_anova(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Computes 1-way ANOVA across the 4 cognitive states for each feature.
    """
    meta_cols = ["subject_id", "group", "label", "state"]
    feature_cols = [c for c in df.columns if c not in meta_cols]
    
    states = ["resting", "internal_concentration", "external_concentration", "mind_wandering"]
    
    anova_results = []
    for col in feature_cols:
        state_groups = [df[df["state"] == s][col].dropna().values for s in states]
        # Filter empty groups
        valid_groups = [g for g in state_groups if len(g) > 1]
        
        if len(valid_groups) >= 2:
            try:
                f_stat, p_val = f_oneway(*valid_groups)
                f_stat = round(float(f_stat), 3)
                p_val = round(float(p_val), 4)
            except Exception:
                f_stat, p_val = 0.0, 1.0
                
            means_per_state = {
                f"{s}_mean": round(float(np.mean(df[df['state'] == s][col].dropna().values)), 3)
                if len(df[df['state'] == s][col].dropna()) > 0 else 0.0
                for s in states
            }
            
            sig = "ns"
            if p_val < 0.001:
                sig = "***"
            elif p_val < 0.01:
                sig = "**"
            elif p_val < 0.05:
                sig = "*"
                
            row = {
                "feature": col,
                "f_statistic": f_stat,
                "p_value": p_val,
                "significance": sig,
                **means_per_state
            }
            anova_results.append(row)
            
    return anova_results
