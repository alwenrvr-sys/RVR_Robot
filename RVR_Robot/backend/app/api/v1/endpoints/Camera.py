from fastapi import APIRouter, HTTPException

from app.schemas.item import (
    CameraTriggerRequest,
    CameraTriggerResponse
)
from app.robot.Camera_service import trigger_camera

router = APIRouter(prefix="/camera", tags=["Camera"])


@router.post("/trigger", response_model=CameraTriggerResponse)
async def trigger_camera_api(payload: CameraTriggerRequest):
    try:
        return await trigger_camera(payload.current_z)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
