from pathlib import Path 
import os 
import time 
import cv2 
import numpy as np 
import json


BASE_DIR = Path(__file__).resolve().parents[3]
DATASET_ROOT = BASE_DIR.parent / "RVR_STORAGE" / "dataset"
INDEX_FILE = BASE_DIR.parent / "RVR_STORAGE" / "models" / "dataset_index.json" 
FEATURE_FILE = BASE_DIR.parent / "RVR_STORAGE" / "models" / "features.npy" 
os.makedirs(DATASET_ROOT, exist_ok=True)


def load_index(): 
    if INDEX_FILE.exists(): 
        with open(INDEX_FILE, "r") as f: 
            return json.load(f) 
    return {"items": []}
    
    
def save_index(data): 
    with open(INDEX_FILE, "w") as f: 
        json.dump(data, f, indent=2) 


def normalize_rotation(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU)
    cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return image
    c = max(cnts, key=cv2.contourArea)
    rect = cv2.minAreaRect(c)
    angle = rect[-1]
    if angle < -45:
        angle = 90 + angle
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), borderMode=cv2.BORDER_REPLICATE)
    return rotated
    
       
def extract_features(image):
    image = normalize_rotation(image)
    image = cv2.resize(image, (128, 128))
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    m = cv2.moments(gray)
    hu = cv2.HuMoments(m).flatten()
    hu = np.sign(hu) * np.log10(np.abs(hu) + 1e-12)
    hist = cv2.calcHist([gray], [0], None, [32], [0, 256]).flatten()
    hist = hist / (hist.sum() + 1e-9)
    return np.concatenate([hu, hist]).astype(np.float32)

def crop_and_store_images(
    full_image: np.ndarray,
    obj: dict,
    group_id: str,
    padding: int = 10
) -> str:
    """
    Perspective-crop object using box_px and store inside dataset/group_id folder.
    Uses BORDER_REPLICATE padding.
    """

    if full_image is None:
        raise ValueError("full_image is None")

    if "box_px" not in obj:
        raise ValueError("obj must contain 'box_px'")

    # Ensure dataset root exists
    dataset_root = str(DATASET_ROOT)
    os.makedirs(dataset_root, exist_ok=True)

    group_folder = os.path.join(dataset_root, group_id)
    os.makedirs(group_folder, exist_ok=True)

    # ---- Prepare box ----
    box = np.array(obj["box_px"], dtype=np.float32)
    rect = order_points(box)
    (tl, tr, br, bl) = rect

    # ---- Compute width & height ----
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = int(max(widthA, widthB))

    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = int(max(heightA, heightB))

    # ---- Add padding ----
    paddedWidth = maxWidth + 2 * padding
    paddedHeight = maxHeight + 2 * padding

    # Destination points with padding offset
    dst = np.array([
        [padding, padding],
        [padding + maxWidth - 1, padding],
        [padding + maxWidth - 1, padding + maxHeight - 1],
        [padding, padding + maxHeight - 1]
    ], dtype=np.float32)

    # ---- Perspective Transform ----
    M = cv2.getPerspectiveTransform(rect, dst)

    warped = cv2.warpPerspective(
        full_image,
        M,
        (paddedWidth, paddedHeight),
        borderMode=cv2.BORDER_REPLICATE
    )

    # ---- Save file ----
    timestamp = int(time.time() * 1000)
    filename = f"{group_id}_{timestamp}.png"
    save_path = os.path.join(group_folder, filename)

    cv2.imwrite(save_path, warped)

    return save_path


def order_points(pts: np.ndarray) -> np.ndarray:
    """
    Orders points as:
    top-left, top-right, bottom-right, bottom-left
    """
    rect = np.zeros((4, 2), dtype="float32")

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # top-left
    rect[2] = pts[np.argmax(s)]  # bottom-right

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # top-right
    rect[3] = pts[np.argmax(diff)]  # bottom-left

    return rect


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9)


def geometry_similarity(g1, g2):
    w_sim = 1 - abs(g1["width"] - g2["width"]) / max(g2["width"], 1e-6)
    h_sim = 1 - abs(g1["height"] - g2["height"]) / max(g2["height"], 1e-6)
    a_sim = 1 - abs(g1["area"] - g2["area"]) / max(g2["area"], 1e-6)
    return max(0, (w_sim + h_sim + a_sim) / 3.0)


def crop_from_box(full_image: np.ndarray, obj: dict, padding: int = 10):
    box = np.array(obj["box_px"], dtype=np.float32)
    rect = order_points(box)
    (tl, tr, br, bl) = rect
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = int(max(widthA, widthB))
    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = int(max(heightA, heightB))
    paddedWidth = maxWidth + 2 * padding
    paddedHeight = maxHeight + 2 * padding
    dst = np.array([
        [padding, padding],
        [padding + maxWidth - 1, padding],
        [padding + maxWidth - 1, padding + maxHeight - 1],
        [padding, padding + maxHeight - 1]
    ], dtype=np.float32)
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(
        full_image,
        M,
        (paddedWidth, paddedHeight),
        borderMode=cv2.BORDER_REPLICATE
    )
    warped = normalize_rotation(warped)
    warped = cv2.resize(warped, (128, 128))
    return warped


def predict_object(
    group,
    full_image,
    dataset_features,
    dataset_index,
    threshold=0.65
):
    if not dataset_index or not dataset_index.get("items"):
        return None, 0.0

    if dataset_features is None:
        return None, 0.0

    label_scores = {}

    # ---- Extract features for ALL objects in group ----
    group_features = []

    for obj in group.get("objects", []):
        crop = crop_from_box(full_image, obj)
        feat = extract_features(crop)
        group_features.append(feat)

    if not group_features:
        return None, 0.0

    # ---- Compare against dataset ----
    for i, item in enumerate(dataset_index["items"]):
        db_feat = dataset_features[i]
        label = item["label"]

        sims = []
        for feat in group_features:
            sim = cosine_similarity(feat, db_feat)
            sims.append(sim)

        avg_sim = float(np.mean(sims))

        if label not in label_scores:
            label_scores[label] = []

        label_scores[label].append(avg_sim)

    # ---- Aggregate per label ----
    final_scores = {
        label: float(np.mean(scores))
        for label, scores in label_scores.items()
    }

    best_label = max(final_scores, key=final_scores.get)
    best_score = final_scores[best_label]

    if best_score >= threshold:
        return best_label, best_score

    return None, best_score



