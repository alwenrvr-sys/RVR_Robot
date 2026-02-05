from fastapi import APIRouter, HTTPException

from app.schemas.item import (
    CameraTriggerRequest,
    CameraTriggerResponse
)
from app.robot.Camera_service import trigger_camera

router = APIRouter(prefix="/camera", tags=["Camera"])


@router.post(
    "/trigger",
    response_model=CameraTriggerResponse
)
async def trigger_camera_api(req: CameraTriggerRequest):
    result = await trigger_camera(req.current_z)

    return {
        "status": "ok",
        "message": "Camera triggered",
        **result
    }

