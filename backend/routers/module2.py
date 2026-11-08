import json
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from utils.config import RESULTS_DIR
from utils.excel_exporter import read_excel_sheets

router = APIRouter(prefix="/api/module2", tags=["Module 2 - Expert vs Non-Expert"])

FILENAME = "module2_expert_vs_nonexpert.xlsx"
MAPPING_FILE = "module2_biomarker_mappings.json"

@router.get("/results")
def get_module2_results():
    """Returns parsed JSON results from Module 2 Excel report."""
    data = read_excel_sheets(FILENAME)
    if not data:
        return {"status": "not_ready", "message": "Module 2 results not generated yet. Run pipeline first.", "data": {}}
    return {"status": "ready", "data": data}

@router.get("/download")
def download_module2_excel():
    """Serves the generated Module 2 Excel file directly."""
    file_path = RESULTS_DIR / FILENAME
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Module 2 Excel report not found. Run pipeline first.")
    return FileResponse(
        path=str(file_path),
        filename=FILENAME,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/statistics")
def get_group_statistics(modality: str = Query("all", description="all, EEG, ECG, or Coupling")):
    """Returns parsed group statistical differences with t-stats, p-values, and effect sizes."""
    data = read_excel_sheets(FILENAME)
    if not data or "Group_Differences" not in data:
        return {"status": "not_ready", "markers": []}
    
    markers = data["Group_Differences"]
    if modality.lower() != "all":
        markers = [m for m in markers if str(m.get("modality", "")).lower() == modality.lower()]
    
    return {
        "status": "ready",
        "total_markers": len(markers),
        "markers": markers
    }

@router.get("/mappings")
def get_biomarker_mappings():
    """Returns the structured JSON mapping object for Module 2 biomarkers and layman context."""
    path = RESULTS_DIR / MAPPING_FILE
    if not path.exists():
        raise HTTPException(status_code=404, detail="Module 2 biomarker mappings file not found.")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
