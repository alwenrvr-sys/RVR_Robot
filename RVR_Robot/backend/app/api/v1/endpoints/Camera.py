from fastapi import APIRouter, HTTPException
import base64
import cv2
import numpy as np
from app.schemas.item import (
    CameraTriggerRequest,
    CameraTriggerResponse
)
from app.schemas.item import (
    AnalyzeImageRequest,
    AnalyzeImageResponse
)
from app.robot.Camera_service import trigger_camera
from app.robot.Helpers import analyze_image

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

@router.post("/analyze", response_model=AnalyzeImageResponse)
def analyze_image_api(payload: AnalyzeImageRequest):
    try:
        # ---- decode base64 image ----
        img_bytes = base64.b64decode(payload.image_base64)
        img_np = np.frombuffer(img_bytes, np.uint8)
        bgr = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        if bgr is None:
            raise RuntimeError("Invalid image")

        # ---- call vision core ----
        result = analyze_image(
            bgr=bgr,
            tcp=payload.tcp,
            white_thresh=payload.white_thresh,
            auto_thresh=payload.auto_thresh,
            enable_edges=payload.enable_edges,
            # enable_ocr=payload.enable_ocr,
            # ocr_roi=payload.ocr_roi
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))