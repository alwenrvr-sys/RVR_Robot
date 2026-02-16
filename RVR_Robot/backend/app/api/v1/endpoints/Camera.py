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
from app.robot.Helpers import sort_analyze_image
from app.ML.Ml_Service import load_index, predict_object,crop_and_store_images, FEATURE_FILE
import numpy as np

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

# @router.post("/analyze", response_model=AllAnalyzeImageResponse)
# def analyze_image_api(payload: AnalyzeImageRequest):
#     try:
#         # ---- decode base64 image ----
#         img_bytes = base64.b64decode(payload.image_base64)
#         img_np = np.frombuffer(img_bytes, np.uint8)
#         bgr = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

#         if bgr is None:
#             raise RuntimeError("Invalid image")

#         # ---- call vision core ----
#         result = sort_analyze_image(
#             bgr=bgr,
#             tcp=payload.tcp,
#             minarea=payload.min_area,
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

    # ---------------- Decode Image ----------------
    img_bytes = base64.b64decode(payload.image_base64)
    img_np = np.frombuffer(img_bytes, np.uint8)
    bgr = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    if bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    # ---------------- Vision Analysis ----------------
    analysis = sort_analyze_image(
        bgr=bgr,
        tcp=payload.tcp,
        minarea=payload.min_area,
        white_thresh=payload.white_thresh,
        auto_thresh=payload.auto_thresh,
        enable_edges=payload.enable_edges,
    )

    if not analysis.get("success"):
        return analysis

    # ---------------- Load ML Data ----------------
    dataset_index = load_index()

    if FEATURE_FILE.exists():
        dataset_features = np.load(FEATURE_FILE)
    else:
        dataset_features = None

    # ---------------- ML Predict Per Group ----------------
    from app.ML.Ml_Service import predict_object

    for g in analysis["groups"]:

        # Attach object references to group
        g["objects"] = [
            o for o in analysis["objects"]
            if o["id"] in g["object_ids"]
        ]

        predicted_label = None
        confidence = 0.0

        # Only predict if model exists
        if dataset_features is not None and dataset_index.get("items"):

            predicted_label, confidence = predict_object(
                group=g,
                full_image=bgr,
                dataset_features=dataset_features,
                dataset_index=dataset_index,
                threshold=0.65,   # Industrial safe threshold
            )
            print(predicted_label," ",confidence)
        # ---------------- Apply Result ----------------
        if predicted_label:
            g["group_id"] = predicted_label
            g["confidence"] = round(confidence, 3)
        else:
            g["confidence"] = round(confidence, 3)

            # Save unknown samples for future training
            for obj in g["objects"]:
                crop_and_store_images(
                    full_image=bgr,
                    obj=obj,
                    group_id=g["group_id"],  # still G1/G2
                )

    return analysis

