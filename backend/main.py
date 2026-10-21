from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from utils.config import FIGURES_DIR, RESULTS_DIR

from routers.pipeline import router as pipeline_router
from routers.dataset import router as dataset_router
from routers.module1 import router as module1_router
from routers.module2 import router as module2_router
from routers.module3 import router as module3_router
from routers.module4 import router as module4_router

app = FastAPI(
    title="EEG-ECG Yoga Experience Analysis Platform",
    description="Multimodal EEG-ECG analysis platform investigating physiological differences associated with yoga experience (Project MP2026CSE86).",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default: http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(pipeline_router)
app.include_router(dataset_router)
app.include_router(module1_router)
app.include_router(module2_router)
app.include_router(module3_router)
app.include_router(module4_router)

# Mount figures directory for topomaps and plots
app.mount("/static/figures", StaticFiles(directory=str(FIGURES_DIR)), name="figures")

@app.get("/")
def root():
    return {
        "project": "EEG-ECG Yoga Experience Analysis",
        "team_id": "MP2026CSE86",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
