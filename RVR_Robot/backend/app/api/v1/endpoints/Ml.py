from fastapi import APIRouter
from pathlib import Path
import os
import cv2
import numpy as np
import base64

from app.ML.Ml_Service import (
    DATASET_ROOT,
    FEATURE_FILE,
    load_index,
    save_index,
    extract_features,
    predict_object,
)

router = APIRouter(prefix="/ml", tags=["ML"])


@router.post("/get-groups")
def get_groups():
    groups = []
    for folder in os.listdir(DATASET_ROOT):
        if folder.startswith("G"):  
            folder_path = DATASET_ROOT / folder
            images = [
                f"/dataset/{folder}/{img}"
                for img in os.listdir(folder_path)
            ]
            groups.append({
                "group_id": folder,
                "image_count": len(images),
                "images": images,
            })
    return {"success": True, "groups": groups}


@router.post("/assign-label")
def assign_label(payload: dict):
    group_id = payload.get("group_id")
    label = payload.get("label")
    if not group_id or not label:
        return {"success": False, "error": "Missing data"}
    group_folder = DATASET_ROOT / group_id
    if not group_folder.exists():
        return {"success": False, "error": "Group folder not found"}
    label_folder = DATASET_ROOT / label
    os.makedirs(label_folder, exist_ok=True)
    for file in os.listdir(group_folder):
        src = group_folder / file
        dst = label_folder / file
        os.replace(src, dst)
    os.rmdir(group_folder)
    return {"success": True}


@router.post("/rebuild")
def rebuild_model():
    index = {"items": []}
    features = []
    for label in os.listdir(DATASET_ROOT):
        label_path = DATASET_ROOT / label
        if not os.path.isdir(label_path):
            continue
        for img_file in os.listdir(label_path):
            img_path = label_path / img_file
            img = cv2.imread(str(img_path))
            if img is None:
                continue
            feat = extract_features(img)
            features.append(feat)
            index["items"].append({
                "label": label,
                "geometry": None  # optional
            })
    if not features:
        return {"success": False, "error": "No data found"}
    np.save(FEATURE_FILE, np.array(features))
    save_index(index)
    return {
        "success": True,
        "samples": len(features),
        "classes": len(set(i["label"] for i in index["items"]))
    }


 
