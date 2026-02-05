import cv2
import numpy as np
import math
import pytesseract
import os
import time
import base64


FTP_IMAGE_DIR = r"C:\ftp_root\nova"
SUPPORTED_EXTS = (".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff")

def image_to_base64(img) -> str:
    _, buffer = cv2.imencode(".jpg", img)
    return base64.b64encode(buffer).decode("utf-8")

def normalize_angle_180(angle_deg: float) -> float:
    angle = angle_deg % 180.0
    if angle < 0:
        angle += 180.0
    return angle

def scale_calculation(z: float) -> float:
    if z == 0:
        raise ValueError("z must be non-zero")
    return 13878.4973 * (z ** -1.2219)

def scale_calculation_y(z: float) -> float:
    if z == 0:
        raise ValueError("z must be non-zero")
    return 15200.1681 * (z ** -1.24164)

def pca_orientation_deg(contour) -> float:
    pts = contour.reshape(-1, 2).astype(np.float32)
    mean = np.mean(pts, axis=0)
    centered = pts - mean
    cov = np.cov(centered.T)
    eigvals, eigvecs = np.linalg.eig(cov)
    v = eigvecs[:, int(np.argmax(eigvals))]
    return normalize_angle_180(math.degrees(math.atan2(v[1], v[0])))

def rect_orientation_deg(contour):
    rect = cv2.minAreaRect(contour)
    (_, _), (w, h), ang = rect
    box = cv2.boxPoints(rect).astype(np.int32)
    if w < h:
        w, h = h, w
        ang += 90.0
    return normalize_angle_180(ang), float(w), float(h), box

def object_present(
    gray: np.ndarray,
    white_thresh: int = 150,
    min_area: int = 1500
) -> bool:
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    _, mask = cv2.threshold(
        blur,
        white_thresh,
        255,
        cv2.THRESH_BINARY_INV
    )

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    for c in contours:
        if cv2.contourArea(c) > min_area:
            return True

    return False

def measure_edges_and_holes(contours, sx: float, sy: float):
    outer = max(contours, key=cv2.contourArea)

    epsilon = 0.01 * cv2.arcLength(outer, True)
    approx = cv2.approxPolyDP(outer, epsilon, True)

    edges_mm = []
    for i in range(len(approx)):
        p1 = approx[i][0]
        p2 = approx[(i + 1) % len(approx)][0]

        dx = (p2[0] - p1[0]) / sx
        dy = (p2[1] - p1[1]) / sy
        edges_mm.append(math.hypot(dx, dy))

    holes = []
    for c in contours:
        if c is outer:
            continue

        area = cv2.contourArea(c)
        if area < 300:
            continue

        (x, y), r = cv2.minEnclosingCircle(c)
        d_mm = (2 * r) / ((sx + sy) * 0.5)

        holes.append({
            "center_px": (int(x), int(y)),
            "diameter_mm": d_mm
        })

    return {
        "edges_mm": edges_mm,
        "holes": holes
    }, approx, outer


def ocr_read_text_and_numbers(
    bgr: np.ndarray,
    roi=None
):
    img = bgr.copy()

    if roi is not None:
        x, y, w, h = roi
        img = img[y:y+h, x:x+w]

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255,
                          cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    config = "--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-"
    text = pytesseract.image_to_string(gray, config=config)

    return text.strip(), gray

def analyze_image(
    bgr: np.ndarray,
    tcp: list,                # [x,y,z,rx,ry,rz]
    static_point_px=(640, 480),
    white_thresh=150,
    auto_thresh=True,
    enable_edges=False,
    enable_ocr=False,
    ocr_roi=None
):
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    # ---- threshold ----
    if auto_thresh:
        _, mask = cv2.threshold(
            gray, 0, 255,
            cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )
    else:
        _, mask = cv2.threshold(
            gray, white_thresh, 255,
            cv2.THRESH_BINARY_INV
        )

    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return {"success": False, "reason": "no contours"}

    subject = max(contours, key=cv2.contourArea)

    # ---- centroid ----
    M = cv2.moments(subject)
    cx = M["m10"] / M["m00"]
    cy = M["m01"] / M["m00"]

    # ---- scale ----
    z = tcp[2]
    sx = scale_calculation(z)
    sy = scale_calculation_y(z)

    ax, ay = static_point_px
    dx_mm = (cx - ax) / sx
    dy_mm = (cy - ay) / sy

    dist_mm = math.hypot(dx_mm, dy_mm)

    # ---- orientation ----
    theta_rect, w_px, h_px, box = rect_orientation_deg(subject)
    theta_pca = pca_orientation_deg(subject)

    # ---- robot frame transform ----
    Rz = tcp[5]
    a1 = math.radians(Rz - 45.0)
    a2 = math.radians(theta_rect + Rz - 45.0 - 90.0)

    p = 46.5 * math.cos(a1) + dist_mm * math.cos(a2)
    q = 46.5 * math.sin(a1) + dist_mm * math.sin(a2)

    target_x = tcp[0] + p
    target_y = tcp[1] + q

    result = {
        "success": True,
        "center_px": (cx, cy),
        "distance_mm": dist_mm,
        "theta_rect": theta_rect,
        "theta_pca": theta_pca,
        "target": {
            "x": target_x,
            "y": target_y,
            "rz": Rz
        }
    }

    # ---- inspection ----
    if enable_edges:
        measurements, _, _ = measure_edges_and_holes(contours, sx, sy)
        result["inspection"] = measurements

    # ---- OCR ----
    if enable_ocr:
        text, _ = ocr_read_text_and_numbers(bgr, ocr_roi)
        result["ocr"] = text

    return result

def wait_for_image_ready(path: str, timeout: float = 2.0) -> bool:
    start = time.time()
    last_size = -1

    while time.time() - start < timeout:
        try:
            size = os.path.getsize(path)
            if size > 0 and size == last_size:
                return True
            last_size = size
        except OSError:
            pass

        time.sleep(0.1)

    return False

def get_latest_image_path(
    directory: str,
    extensions=SUPPORTED_EXTS
) -> str | None:
    files = [
        os.path.join(directory, f)
        for f in os.listdir(directory)
        if f.lower().endswith(extensions)
    ]

    if not files:
        return None

    return max(files, key=os.path.getmtime)
