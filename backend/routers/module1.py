from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from utils.config import RESULTS_DIR
from utils.excel_exporter import read_excel_sheets

router = APIRouter(prefix="/api/module1", tags=["Module 1 - Modality Comparison"])

FILENAME = "module1_modality_comparison.xlsx"

@router.get("/results")
def get_module1_results():
    """Returns parsed JSON results from Module 1 Excel report."""
    data = read_excel_sheets(FILENAME)
    if not data:
        return {"status": "not_ready", "message": "Module 1 results not generated yet. Run pipeline first.", "data": {}}
    return {"status": "ready", "data": data}

@router.get("/download")
def download_module1_excel():
    """Serves the generated Module 1 Excel file directly."""
    file_path = RESULTS_DIR / FILENAME
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Module 1 Excel report not found. Run pipeline first.")
    return FileResponse(
        path=str(file_path),
        filename=FILENAME,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
