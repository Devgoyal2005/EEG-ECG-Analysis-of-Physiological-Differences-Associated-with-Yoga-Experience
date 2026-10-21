from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from utils.config import RAW_DATA_DIR, RESULTS_DIR
from utils.excel_exporter import export_dict_to_excel
from pipeline.data_loader import (
    find_brainvision_recordings,
    load_brainvision_recording,
    generate_synthetic_subject_data
)
from pipeline.eeg_preprocessor import preprocess_eeg
from pipeline.alignment_segmentation import segment_epochs_by_state
from pipeline.feature_extractor import extract_features_from_epochs
from pipeline.ml_trainer import evaluate_representation_models
from pipeline.statistics import analyze_expert_vs_control_differences, analyze_states_anova
from pipeline.clustering import perform_kmeans_clustering

pipeline_status = {
    "is_running": False,
    "current_step": "idle",
    "progress_pct": 0,
    "message": "Ready"
}

def update_status(step: str, progress: int, message: str):
    global pipeline_status
    pipeline_status["is_running"] = True
    pipeline_status["current_step"] = step
    pipeline_status["progress_pct"] = progress
    pipeline_status["message"] = message
    print(f"[{progress}%] {step}: {message}")


def run_full_pipeline(use_synthetic_if_empty: bool = True, num_synthetic_subjects: int = 6) -> Dict[str, Any]:
    """
    Executes the entire end-to-end pipeline:
    1. Loads BrainVision recordings (or generates synthetic testing cohort if empty)
    2. Runs EEG filtering, notch filter, and artifact rejection
    3. Segments epochs across 4 cognitive states
    4. Extracts 4 representation matrices: EEG-only, ECG-only, Combined, EEG+ECG+Interaction
    5. Runs ML classification benchmark with subject-independent validation
    6. Performs statistical tests (expert vs control) & 4-state ANOVA
    7. Runs unsupervised K-Means clustering & PCA projections
    8. Exports results to 4 structured Excel sheets
    """
    global pipeline_status
    try:
        update_status("Data Ingestion", 5, "Scanning for BrainVision recordings...")
        vhdr_files = find_brainvision_recordings(RAW_DATA_DIR)
        
        # If no files found and fallback requested, generate sample subjects
        if len(vhdr_files) == 0 and use_synthetic_if_empty:
            update_status("Data Ingestion", 10, f"Creating {num_synthetic_subjects} synthetic demo subjects (3 experts, 3 controls)...")
            vhdr_files = []
            for i in range(num_synthetic_subjects):
                grp = "expert" if i % 2 == 0 else "control"
                s_id = f"Subj_{i+1:02d}_{grp.capitalize()}"
                vhdr_path = generate_synthetic_subject_data(subject_id=s_id, group=grp, duration_sec=60)
                vhdr_files.append(vhdr_path)
                
        all_eeg_dfs = []
        all_ecg_dfs = []
        all_combined_dfs = []
        all_interaction_dfs = []
        
        total_files = len(vhdr_files)
        update_status("Preprocessing", 20, f"Processing {total_files} subjects...")
        
        # Load ground truth group labels from participants.tsv if available
        participants_map = {}
        part_tsv = RAW_DATA_DIR / "participants.tsv"
        if part_tsv.exists():
            try:
                p_df = pd.read_csv(part_tsv, sep="\t")
                for _, row in p_df.iterrows():
                    pid = str(row["participant_id"]).strip()
                    is_ctrl = int(row.get("control", 0)) == 1
                    participants_map[pid] = "control" if is_ctrl else "expert"
            except Exception as e:
                print("Notice reading participants.tsv:", e)

        for idx, vpath in enumerate(vhdr_files):
            subject_id = vpath.stem
            # Identify BIDS participant key (e.g. sub-001)
            sub_key = None
            for p in vpath.parts:
                if p.startswith("sub-"):
                    sub_key = p
                    break
            if sub_key and sub_key in participants_map:
                group = participants_map[sub_key]
            elif "expert" in subject_id.lower() or "yoga" in subject_id.lower():
                group = "expert"
            else:
                group = "control"
            
            pct = 20 + int((idx / max(1, total_files)) * 30)
            update_status("Preprocessing", pct, f"Filtering & epoching {sub_key or subject_id} ({idx+1}/{total_files})...")
            
            raw, ecg_ch = load_brainvision_recording(vpath)
            epochs = segment_epochs_by_state(raw, ecg_ch_name=ecg_ch or "ECG", epoch_duration_sec=5.0)
            df_eeg, df_ecg, df_comb, df_inter = extract_features_from_epochs(epochs, subject_id=subject_id, group=group)
            
            all_eeg_dfs.append(df_eeg)
            all_ecg_dfs.append(df_ecg)
            all_combined_dfs.append(df_comb)
            all_interaction_dfs.append(df_inter)
            
        # Concatenate across cohort
        dataset_eeg = pd.concat(all_eeg_dfs, ignore_index=True)
        dataset_ecg = pd.concat(all_ecg_dfs, ignore_index=True)
        dataset_comb = pd.concat(all_combined_dfs, ignore_index=True)
        dataset_inter = pd.concat(all_interaction_dfs, ignore_index=True)
        
        # ----------------------------------------------------
        # MODULE 1: Classifier Effectiveness across 4 Representations
        # ----------------------------------------------------
        update_status("Module 1 Evaluation", 55, "Evaluating ML models across all 4 signal representations...")
        m1_eeg, _, imp_eeg = evaluate_representation_models(dataset_eeg, "EEG-Only")
        m1_ecg, _, imp_ecg = evaluate_representation_models(dataset_ecg, "ECG-Only")
        m1_comb, _, imp_comb = evaluate_representation_models(dataset_comb, "Combined EEG+ECG")
        m1_inter, _, imp_inter = evaluate_representation_models(dataset_inter, "EEG+ECG+Interaction")
        
        m1_all_results = m1_eeg + m1_ecg + m1_comb + m1_inter
        m1_df = pd.DataFrame(m1_all_results)
        
        # Summary winner
        best_row = m1_df.loc[m1_df["f1_score"].idxmax()].to_dict() if len(m1_df) > 0 else {}
        
        export_dict_to_excel({
            "Summary": [best_row],
            "All_Models_Comparison": m1_df,
            "EEG_Only": pd.DataFrame(m1_eeg),
            "ECG_Only": pd.DataFrame(m1_ecg),
            "Combined_EEG_ECG": pd.DataFrame(m1_comb),
            "EEG_ECG_Interaction": pd.DataFrame(m1_inter),
            "Top_Features": pd.DataFrame(imp_inter)
        }, "module1_modality_comparison.xlsx")
        
        # ----------------------------------------------------
        # MODULE 2: Expert vs Non-Expert Differences
        # ----------------------------------------------------
        update_status("Module 2 Statistics", 70, "Computing group differences, t-tests, and Cohen's d...")
        group_diffs = analyze_expert_vs_control_differences(dataset_inter)
        
        export_dict_to_excel({
            "Group_Differences": group_diffs,
            "Significant_Markers": [g for g in group_diffs if g["significance"] != "ns"]
        }, "module2_expert_vs_nonexpert.xlsx")
        
        # ----------------------------------------------------
        # MODULE 3: 4 Physiological States Analysis
        # ----------------------------------------------------
        update_status("Module 3 Analysis", 82, "Analyzing dynamics across 4 cognitive states (ANOVA)...")
        states_anova = analyze_states_anova(dataset_inter)
        
        export_dict_to_excel({
            "States_ANOVA": states_anova
        }, "module3_physiological_states.xlsx")
        
        # ----------------------------------------------------
        # MODULE 4: ML Benchmark & Unsupervised K-Means Clustering
        # ----------------------------------------------------
        update_status("Module 4 Benchmark & Clustering", 92, "Running K-Means clustering and PCA projections...")
        kmeans_sweep, scatter_points, cluster_summary = perform_kmeans_clustering(dataset_inter)
        
        export_dict_to_excel({
            "Cluster_Summary": [cluster_summary],
            "KMeans_Silhouette_Sweep": kmeans_sweep,
            "Cluster_PCA_Points": scatter_points,
            "ML_Leaderboard": m1_df.sort_values(by="f1_score", ascending=False)
        }, "module4_ml_benchmark_clustering.xlsx")
        
        update_status("Complete", 100, "Pipeline completed successfully. All 4 Excel reports generated!")
        pipeline_status["is_running"] = False
        
        return {
            "status": "success",
            "message": "Pipeline completed successfully",
            "subjects_processed": total_files,
            "module1_winner": best_row,
            "clustering_summary": cluster_summary
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        pipeline_status["is_running"] = False
        pipeline_status["message"] = f"Error: {str(e)}"
        return {"status": "error", "message": str(e)}
