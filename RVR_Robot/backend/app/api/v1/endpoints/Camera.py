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
    AnalyzeImageResponse,
    AllAnalyzeImageResponse
)
from app.robot.Camera_service import trigger_camera,run_camera_autosetup,ping_camera
from app.robot.Helpers import analyze_image,sort_analyze_image,fetch_datasets


router = APIRouter(prefix="/camera", tags=["Camera"])

@router.get("/ping")
async def camera_ping():
    ok = await ping_camera()
    return {
        "connected": ok
    }

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
    
@router.post("/autosetup")
async def run_autosetup_api():
    try:
        await run_camera_autosetup()
        return {
            "status": "ok",
            "message": "Camera AutoSetup completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/analyze", response_model=AnalyzeImageResponse)
# def analyze_image_api(payload: AnalyzeImageRequest):
#     try:
#         # ---- decode base64 image ----
#         img_bytes = base64.b64decode(payload.image_base64)
#         img_np = np.frombuffer(img_bytes, np.uint8)
#         bgr = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

#         if bgr is None:
#             raise RuntimeError("Invalid image")

#         # ---- call vision core ----
#         result = analyze_image(
#             bgr=bgr,
#             tcp=payload.tcp,
            # minarea=payload.min_area,
#             white_thresh=payload.white_thresh,
#             auto_thresh=payload.auto_thresh,
#             enable_edges=payload.enable_edges,
#             # enable_ocr=payload.enable_ocr,
#             # ocr_roi=payload.ocr_roi
#         )

#         return result

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", response_model=AllAnalyzeImageResponse)
def analyze_image_api(payload: AnalyzeImageRequest):
    try:
        # ---- decode base64 image ----
        img_bytes = base64.b64decode(payload.image_base64)
        img_np = np.frombuffer(img_bytes, np.uint8)
        bgr = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        if bgr is None:
            raise RuntimeError("Invalid image")

        # ---- call vision core ----
        result = sort_analyze_image(
            bgr=bgr,
            tcp=payload.tcp,
            minarea=payload.min_area,
            white_thresh=payload.white_thresh,
            auto_thresh=payload.auto_thresh,
            enable_edges=payload.enable_edges,
            # enable_ocr=payload.enable_ocr,
            # ocr_roi=payload.ocr_roi
        )
        # if result.get("success"):
        #     fetch_datasets(bgr, result)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))