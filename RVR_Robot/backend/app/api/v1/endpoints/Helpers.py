import base64
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from app.robot.Helpers import analyze_image

from app.robot.Helpers import (
    AnalyzeImageRequest,
    AnalyzeImageResponse
)

router = APIRouter(prefix="/camera", tags=["Vision"])

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
            enable_ocr=payload.enable_ocr,
            ocr_roi=payload.ocr_roi
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))