from pathlib import Path
import os
import time
import cv2
import numpy as np

# Resolve project root safely
BASE_DIR = Path(__file__).resolve().parents[3]  # RVR_Robot
DATASET_ROOT = BASE_DIR.parent / "RVR_STORAGE" / "dataset"

def crop_and_store_by_group(
    full_image: np.ndarray,
    obj: dict,
    group_id: str,
    padding: int = 10
):
    dataset_root = str(DATASET_ROOT)

    os.makedirs(dataset_root, exist_ok=True)

    group_folder = os.path.join(dataset_root, group_id)
    os.makedirs(group_folder, exist_ok=True)

    box = np.array(obj["box_px"], dtype=np.int32)

    x, y, w, h = cv2.boundingRect(box)

    x = max(0, x - padding)
    y = max(0, y - padding)
    w = min(full_image.shape[1] - x, w + 2 * padding)
    h = min(full_image.shape[0] - y, h + 2 * padding)

    crop = full_image[y:y+h, x:x+w].copy()

    timestamp = int(time.time() * 1000)
    filename = f"{group_id}_{timestamp}.png"
    save_path = os.path.join(group_folder, filename)

    cv2.imwrite(save_path, crop)

    return save_path
