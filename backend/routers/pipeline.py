import asyncio
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from pipeline.runner import run_full_pipeline, pipeline_status

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])

class PipelineTriggerRequest(BaseModel):
    use_synthetic_if_empty: Optional[bool] = True
    num_synthetic_subjects: Optional[int] = 6

@router.post("/run")
def trigger_pipeline(request: PipelineTriggerRequest, background_tasks: BackgroundTasks):
    """Triggers the full EEG-ECG processing pipeline in the background."""
    if pipeline_status["is_running"]:
        return {"status": "busy", "message": "Pipeline is already running."}
    
    background_tasks.add_task(
        run_full_pipeline, 
        use_synthetic_if_empty=request.use_synthetic_if_empty,
        num_synthetic_subjects=request.num_synthetic_subjects
    )
    return {"status": "started", "message": "Pipeline initiated in background."}

@router.get("/status")
def get_pipeline_status():
    """Returns current progress and execution status of the pipeline."""
    return pipeline_status
