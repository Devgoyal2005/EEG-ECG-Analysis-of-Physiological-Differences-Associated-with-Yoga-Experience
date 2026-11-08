import json
import random
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from utils.config import RESULTS_DIR
from utils.excel_exporter import read_excel_sheets

router = APIRouter(prefix="/api/module4", tags=["Module 4 - ML Benchmark & Clustering"])

FILENAME = "module4_ml_benchmark_clustering.xlsx"
MAPPING_FILE = "module4_clustering_mappings.json"

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

@router.get("/cluster-points")
def get_cluster_points(state: str = Query("all", description="all, resting, internal, external, mind_wandering")):
    """Returns a stratified, fast-rendering 2D PCA point sample with cluster and cohort labels."""
    data = read_excel_sheets(FILENAME)
    if not data or "Cluster_PCA_Points" not in data:
        return {"status": "not_ready", "points": []}
    
    rows = data["Cluster_PCA_Points"]
    if state.lower() != "all":
        # Map colloquial names to data state names
        state_map = {
            "internal": "internal_concentration",
            "external": "external_concentration",
            "mind_wandering": "mind_wandering",
            "resting": "resting"
        }
        target = state_map.get(state.lower(), state.lower())
        rows = [r for r in rows if str(r.get("state", "")).lower() == target]

    # Sample uniformly up to 350 points for snappy rendering in browser
    if len(rows) > 350:
        step = len(rows) // 350
        rows = rows[::step][:350]

    points = []
    for r in rows:
        points.append({
            "x": round(float(r.get("pca_x", 0)), 3),
            "y": round(float(r.get("pca_y", 0)), 3),
            "cluster": int(r.get("cluster", 0)),
            "true_group": str(r.get("true_group", "control")).lower(),
            "state": str(r.get("state", "resting")),
            "subject": str(r.get("subject_id", "")).split("_")[0]
        })

    return {
        "status": "ready",
        "total_returned": len(points),
        "points": points
    }

@router.get("/silhouette-sweep")
def get_silhouette_sweep():
    """Returns K-Means silhouette scores and inertia values for k=2..6."""
    data = read_excel_sheets(FILENAME)
    if not data or "KMeans_Silhouette_Sweep" not in data:
        return {"status": "not_ready", "sweep": []}
    return {
        "status": "ready",
        "sweep": data["KMeans_Silhouette_Sweep"]
    }

@router.get("/leaderboard")
def get_ml_leaderboard(modality: str = Query("all", description="all, EEG, ECG, Combined")):
    """Returns full machine learning model ranking."""
    data = read_excel_sheets(FILENAME)
    if not data or "ML_Leaderboard" not in data:
        return {"status": "not_ready", "leaderboard": []}
    
    board = data["ML_Leaderboard"]
    if modality.lower() != "all":
        board = [b for b in board if modality.lower() in str(b.get("representation", "")).lower()]
    
    return {
        "status": "ready",
        "total": len(board),
        "leaderboard": board
    }

@router.get("/mappings")
def get_clustering_mappings():
    """Returns structured JSON mapping object for Module 4."""
    path = RESULTS_DIR / MAPPING_FILE
    if not path.exists():
        raise HTTPException(status_code=404, detail="Module 4 mappings file not found.")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
