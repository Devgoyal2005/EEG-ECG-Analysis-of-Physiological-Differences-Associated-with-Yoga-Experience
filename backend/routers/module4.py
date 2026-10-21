from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from utils.config import RESULTS_DIR
from utils.excel_exporter import read_excel_sheets

router = APIRouter(prefix="/api/module4", tags=["Module 4 - ML Benchmark & Clustering"])

FILENAME = "module4_ml_benchmark_clustering.xlsx"

@router.get("/results")
def get_module4_results():
    """Returns parsed JSON results from Module 4 Excel report."""
    data = read_excel_sheets(FILENAME)
    if not data:
        return {"status": "not_ready", "message": "Module 4 results not generated yet. Run pipeline first.", "data": {}}
    return {"status": "ready", "data": data}

@router.get("/download")
def download_module4_excel():
    """Serves the generated Module 4 Excel file directly."""
    file_path = RESULTS_DIR / FILENAME
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Module 4 Excel report not found. Run pipeline first.")
    return FileResponse(
        path=str(file_path),
        filename=FILENAME,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
