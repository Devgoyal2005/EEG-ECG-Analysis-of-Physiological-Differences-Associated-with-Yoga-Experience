import json
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from utils.config import RESULTS_DIR
from utils.excel_exporter import read_excel_sheets

router = APIRouter(prefix="/api/module3", tags=["Module 3 - 4 Physiological States"])

FILENAME = "module3_physiological_states.xlsx"
MAPPING_FILE = "module3_state_mappings.json"

@router.get("/results")
def get_module3_results():
    """Returns parsed JSON results from Module 3 Excel report."""
    data = read_excel_sheets(FILENAME)
    if not data:
        return {"status": "not_ready", "message": "Module 3 results not generated yet. Run pipeline first.", "data": {}}
    return {"status": "ready", "data": data}

@router.get("/download")
def download_module3_excel():
    """Serves the generated Module 3 Excel file directly."""
    file_path = RESULTS_DIR / FILENAME
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Module 3 Excel report not found. Run pipeline first.")
    return FileResponse(
        path=str(file_path),
        filename=FILENAME,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/states-anova")
def get_states_anova(modality: str = Query("all", description="all, EEG, ECG, or Coupling")):
    """Returns parsed 4-state ANOVA statistics filtered by modality."""
    data = read_excel_sheets(FILENAME)
    if not data or "States_ANOVA" not in data:
        return {"status": "not_ready", "features": []}
    
    rows = data["States_ANOVA"]
    if modality.lower() != "all":
        # Determine modality by prefix or convention
        filtered = []
        for r in rows:
            feat = str(r.get("feature", ""))
            if modality.lower() == "eeg" and feat.startswith("eeg_"):
                filtered.append(r)
            elif modality.lower() == "ecg" and feat.startswith("ecg_"):
                filtered.append(r)
            elif modality.lower() == "coupling" and feat.startswith("coupling_"):
                filtered.append(r)
        rows = filtered
    
    return {
        "status": "ready",
        "total_features": len(rows),
        "features": rows
    }

@router.get("/mappings")
def get_state_mappings():
    """Returns the structured JSON mapping object for Module 3 states and layman context."""
    path = RESULTS_DIR / MAPPING_FILE
    if not path.exists():
        raise HTTPException(status_code=404, detail="Module 3 state mappings file not found.")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
