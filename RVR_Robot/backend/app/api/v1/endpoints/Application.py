from app.schemas.item import AutoPickPlaceStartResponse,AutoPickPlaceStopResponse,AutoPickPlaceStatusResponse
from app.Applications.PickAndPlace import AUTO_RESULT, AUTO_RUN, PickAndPlace,StopPickAndPlace
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/app", tags=["Application"])

@router.post("/1-start", response_model=AutoPickPlaceStartResponse)
def start_auto():
    PickAndPlace()
    return {
        "success": True,
        "message": "Auto Pick & Place started",
        "auto_run": True,
    }

@router.post("/1-stop", response_model=AutoPickPlaceStopResponse)
def stop_auto():
    StopPickAndPlace()
    return {
        "success": True,
        "message": "Auto Pick & Place stopped",
        "auto_run": False,
    }

@router.get("/1-status", response_model=AutoPickPlaceStatusResponse)
def auto_status():
    return {
        **AUTO_RESULT,
        "auto_run": AUTO_RUN,
    }