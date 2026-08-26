from fastapi import APIRouter, HTTPException
from videomind.aggregators.base import load_all_aggregates, load_aggregate_result
from videomind.api.jobs import get_job_state

router = APIRouter(prefix="/videos", tags=["Insights & Entities"])

@router.get("/{id}/insights")
async def get_video_insights(id: str):
    state = get_job_state(id)
    if not state:
        raise HTTPException(status_code=404, detail="Video not found")
    
    aggregates = load_all_aggregates(id)
    return {
        "video_id": id,
        "status": state.status,
        "insights": aggregates
    }

@router.get("/{id}/entities")
async def get_video_entities(id: str):
    state = get_job_state(id)
    if not state:
        raise HTTPException(status_code=404, detail="Video not found")
    
    entities_res = load_aggregate_result(id, "entities")
    return {
        "video_id": id,
        "entities": entities_res.get("data", {}) if entities_res else {"people": [], "objects": []}
    }
