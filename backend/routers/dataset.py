import os
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re
import pandas as pd
from utils.config import RAW_DATA_DIR, RESULTS_DIR, HF_DATASET_REPO, HF_TOKEN, BACKEND_DIR
from pipeline.data_loader import (
    find_brainvision_recordings, 
    download_hf_dataset, 
    get_download_status, 
    cancel_download
)

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

class DownloadRequest(BaseModel):
    token: Optional[str] = None
    max_subjects: Optional[int] = None
    metadata_only: Optional[bool] = False

@router.get("/download-status")
def get_current_download_status():
    """Returns the live status of dataset download, including speed, file progress, and resume state."""
    return get_download_status()

@router.post("/cancel-download")
def request_cancel_download():
    """Cancels the current ongoing dataset download."""
    cancel_download()
    return {"status": "cancelled", "message": "Download cancellation requested."}

@router.post("/download")
def trigger_hf_download(req: DownloadRequest, background_tasks: BackgroundTasks):
    """Triggers resilient, resumable dataset download from Hugging Face."""
    token = req.token or HF_TOKEN
    if not token:
        raise HTTPException(status_code=400, detail="Hugging Face token is required for this gated dataset.")
    
    current_status = get_download_status()
    if current_status.get("is_downloading"):
        return {
            "status": "already_running",
            "message": "Dataset download is already in progress.",
            "download_status": current_status
        }
        
    background_tasks.add_task(
        download_hf_dataset, 
        token=token, 
        max_subjects=req.max_subjects, 
        metadata_only=bool(req.metadata_only)
    )
    return {
        "status": "started", 
        "message": f"Downloading/resuming dataset from Hugging Face repository {HF_DATASET_REPO}."
    }

@router.get("/info")
def get_dataset_info():
    """Returns dataset repository details and list of available local recordings."""
    recordings = find_brainvision_recordings(RAW_DATA_DIR)
    
    # Load participants metadata
    participants_file = RAW_DATA_DIR / "participants.tsv"
    participants_list = []
    participants_map = {}
    if participants_file.exists():
        try:
            p_df = pd.read_csv(participants_file, sep="\t")
            p_df = p_df.drop_duplicates(subset=["participant_id"]).reset_index(drop=True)
            p_df = p_df.where(pd.notnull(p_df), None)
            participants_list = p_df.to_dict(orient="records")
            for row in participants_list:
                pid = str(row.get("participant_id", "")).strip()
                is_ctrl = int(row.get("control", 0)) == 1
                participants_map[pid] = "control" if is_ctrl else "expert"
        except Exception as e:
            print("Warning reading participants.tsv:", e)

    subjects = []
    total_signal_bytes = 0
    for r in recordings:
        stem = r.stem
        parent = r.parent
        eeg_file = parent / f"{stem}.eeg"
        vmrk_file = parent / f"{stem}.vmrk"
        
        subj_size = 0
        if r.exists(): subj_size += r.stat().st_size
        if eeg_file.exists(): subj_size += eeg_file.stat().st_size
        if vmrk_file.exists(): subj_size += vmrk_file.stat().st_size
        total_signal_bytes += subj_size
        
        sub_key = None
        ses_key = None
        
        # Extract sub-XXX and ses-YY accurately using regex
        m_sub = re.search(r"(sub-\d+)", stem)
        m_ses = re.search(r"(ses-\d+)", stem)
        if m_sub:
            sub_key = m_sub.group(1)
        if m_ses:
            ses_key = m_ses.group(1)

        if sub_key and sub_key in participants_map:
            group = participants_map[sub_key]
        elif "expert" in stem.lower() or "yoga" in stem.lower():
            group = "expert"
        else:
            group = "control"

        disp_id = f"{sub_key} ({ses_key})" if (sub_key and ses_key) else (sub_key or stem)

        subjects.append({
            "subject_id": disp_id,
            "raw_stem": stem,
            "vhdr_path": str(r),
            "group": group,
            "size_mb": round(subj_size / (1024 * 1024), 2),
            "has_eeg": eeg_file.exists(),
            "has_vmrk": vmrk_file.exists()
        })

    disk_mb = round(total_signal_bytes / (1024 * 1024), 2)

    token_str = HF_TOKEN or ""
    masked_token = f"{token_str[:7]}...{token_str[-4:]}" if len(token_str) > 11 else ("Configured" if token_str else "Not set")
    
    return {
        "repo": HF_DATASET_REPO,
        "raw_data_dir": str(RAW_DATA_DIR),
        "total_recordings_found": len(recordings),
        "disk_size_mb": disk_mb,
        "has_token": bool(token_str),
        "token_snippet": masked_token,
        "subjects": subjects,
        "participants": participants_list
    }

@router.get("/excel-overview")
def get_excel_overview() -> List[Dict[str, Any]]:
    """Returns metadata about all generated Excel workbooks and their sheets."""
    workbooks = [
        {"id": "module1", "filename": "module1_modality_comparison.xlsx", "title": "Module 1: Modality Comparison"},
        {"id": "module2", "filename": "module2_expert_vs_nonexpert.xlsx", "title": "Module 2: Expert vs Control Differences"},
        {"id": "module3", "filename": "module3_physiological_states.xlsx", "title": "Module 3: 4 Physiological States"},
        {"id": "module4", "filename": "module4_ml_benchmark_clustering.xlsx", "title": "Module 4: ML Benchmark & Clustering"}
    ]
    
    overview = []
    for wb in workbooks:
        fpath = RESULTS_DIR / wb["filename"]
        if fpath.exists():
            try:
                excel_file = pd.ExcelFile(str(fpath))
                sheets_info = []
                for s in excel_file.sheet_names:
                    df = pd.read_excel(excel_file, sheet_name=s)
                    sheets_info.append({
                        "sheet_name": s,
                        "row_count": len(df),
                        "column_count": len(df.columns),
                        "columns": list(df.columns)
                    })
                overview.append({
                    **wb,
                    "exists": True,
                    "file_size_kb": round(fpath.stat().st_size / 1024, 1),
                    "sheets": sheets_info
                })
            except Exception as e:
                overview.append({**wb, "exists": True, "error": str(e), "sheets": []})
        else:
            overview.append({**wb, "exists": False, "sheets": []})
            
    return overview

@router.get("/excel-sheet-content")
def get_excel_sheet_content(
    filename: str = Query(..., description="Excel filename e.g. module1_modality_comparison.xlsx"),
    sheet_name: str = Query(..., description="Sheet name e.g. All_Models_Comparison")
):
    """Returns row records and columns for in-browser Excel spreadsheet viewing."""
    fpath = RESULTS_DIR / filename
    if not fpath.exists():
        raise HTTPException(status_code=404, detail=f"File {filename} not found.")
        
    try:
        df = pd.read_excel(str(fpath), sheet_name=sheet_name)
        df = df.where(pd.notnull(df), None)
        return {
            "filename": filename,
            "sheet_name": sheet_name,
            "columns": list(df.columns),
            "total_rows": len(df),
            "rows": df.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading sheet {sheet_name}: {str(e)}")
