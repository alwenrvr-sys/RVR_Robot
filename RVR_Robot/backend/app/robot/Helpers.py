import cv2
import numpy as np
import math
import pytesseract
import os
import time
import base64

GROUP_REGISTRY = []
GROUP_COUNTER = 0


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


def detect_holes_from_hierarchy(contours, hierarchy, sx, sy):
    holes = []
    for i, c in enumerate(contours):
        parent = hierarchy[0][i][3]
        if parent == -1:
            continue
        area = cv2.contourArea(c)
        if area < 300:
            continue
        peri = cv2.arcLength(c, True)
        if peri < 20:
            continue
        circularity = 4 * math.pi * area / (peri * peri)
        if circularity < 0.6:
            continue
        (x, y), r_px = cv2.minEnclosingCircle(c)
        if r_px < 5:
            continue
        mask = np.zeros((1000, 1000), dtype=np.uint8)
        cv2.drawContours(mask, [c], -1, 255, -1)
        if cv2.countNonZero(mask[:3, :]) > 0:
            continue
        r_mm = r_px / ((sx + sy) / 2)
        holes.append({
            "center_px": (int(x), int(y)),
            "diameter_mm": 2 * r_mm
        })
    return holes

def detect_circles_from_contours(
    contours,
    sx: float,
    sy: float,
    min_area: int = 300,
    min_radius_px: float = 5.0,
    circularity_thresh: float = 0.75
):
    circles = []
    scale = (sx + sy) / 2.0

    for c in contours:
        area = cv2.contourArea(c)
        if area < min_area:
            continue

        peri = cv2.arcLength(c, True)
        if peri < 20:
            continue

        # circularity test
        circularity = 4.0 * math.pi * area / (peri * peri)
        if circularity < circularity_thresh:
            continue

        # enclosing circle
        (x, y), r_px = cv2.minEnclosingCircle(c)
        if r_px < min_radius_px:
            continue

        r_mm = r_px / scale

        circles.append({
            "center_px": (int(x), int(y)),
            "radius_px": float(r_px),
            "radius_mm": float(r_mm),
            "diameter_mm": float(2.0 * r_mm)
        })

    return circles


def get_child_contours(parent_contour, contours, hierarchy):
    children = []
    parent_idx = None

    for i, c in enumerate(contours):
        if np.array_equal(c, parent_contour):
            parent_idx = i
            break

    if parent_idx is None:
        return children

    for i, h in enumerate(hierarchy[0]):
        if h[3] == parent_idx:  # parent index
            children.append(contours[i])

    return children


def measure_edges_and_holes(contours, sx: float, sy: float):
    results = {
        "edges_mm": [],
        "width_mm": 0.0,
        "height_mm": 0.0,
        "area_mm2": 0.0,
        "perimeter_mm": 0.0,
    }
    outer = max(contours, key=cv2.contourArea)
    area_px = cv2.contourArea(outer)
    results["area_mm2"] = area_px / (sx * sy)
    peri_px = cv2.arcLength(outer, True)
    results["perimeter_mm"] = peri_px / ((sx + sy) / 2)
    rect = cv2.minAreaRect(outer)
    (_, _), (w_px, h_px), _ = rect
    results["width_mm"] = max(w_px, h_px) / sx
    results["height_mm"] = min(w_px, h_px) / sy
    eps = 0.005 * peri_px
    approx = cv2.approxPolyDP(outer, eps, True)
    for i in range(len(approx)):
        p1 = approx[i][0]
        p2 = approx[(i + 1) % len(approx)][0]
        px_len = np.linalg.norm(p1 - p2)
        mm_len = px_len / ((sx + sy) / 2)
        results["edges_mm"].append(mm_len)
    return results, approx, outer

def filter_object_contours(contours, min_area=2000):
    objs = []
    for c in contours:
        if cv2.contourArea(c) >= min_area:
            objs.append(c)
    return objs

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
    tcp: list,                
    static_point_px=(640, 480),
    white_thresh=150,
    auto_thresh=True,
    enable_edges=False,
):
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
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
    contours, hierarchy = cv2.findContours(
    mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
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
    dx = cx - ax
    dy = cy - ay
    dx_mm = dx / sx
    dy_mm = dy / sy
    dist_mm = math.hypot(dx_mm, dy_mm)

    # ---- orientation ----
    theta_vector = (math.degrees(math.atan2(-dy, dx)) + 360.0) % 360.0
    theta_subject_rect, rw_px, rh_px, box = rect_orientation_deg(subject)
    theta_subject_pca = pca_orientation_deg(subject)

    # ---- robot frame transform ----
    Rz = tcp[5]
    a1 = math.radians(Rz - 45.0)
    a2 = math.radians(theta_vector + Rz - 45.0 - 90.0)

    p = 46.5 * math.cos(a1) + dist_mm * math.cos(a2)
    q = 46.5 * math.sin(a1) + dist_mm * math.sin(a2)
    tvp = dist_mm * math.cos(a2)
    tvq = dist_mm * math.sin(a2)
    target_x = tcp[0] + p
    target_y = tcp[1] + q
    target_Rz = Rz
    if theta_subject_rect > 90:
        target_Rz = Rz + (180 - theta_subject_rect)
    elif theta_subject_rect < 90:
        target_Rz = Rz - theta_subject_rect
    result = {
    "success": True,
    "center_px": [float(cx), float(cy)],
    "static_center_px": list(static_point_px),
    "contour_px": subject.reshape(-1, 2).astype(int).tolist(),
    "box_px": box.astype(int).tolist(),
    "theta_rect": theta_subject_rect,
    "theta_pca": theta_subject_pca,
    "distance_mm": dist_mm,
    "target": {
        "target_X": target_x,
        "target_Y": target_y,
        "target_Rz": target_Rz
    },
    "ocr": None
}

    if enable_edges:
        measurements, approx_edges, _ = measure_edges_and_holes(contours, sx, sy)
        # holes = detect_holes_from_hierarchy(contours, hierarchy, sx, sy)
        # measurements["holes"] = holes
        circles = detect_circles_from_contours(contours, sx, sy)
        measurements["circles"] = circles
        result["inspection"] = measurements
        result["edges_px"] = approx_edges.reshape(-1, 2).astype(int).tolist()

    # ---- OCR ----
    # if enable_ocr:
    #     text, _ = ocr_read_text_and_numbers(bgr, ocr_roi)
    #     result["ocr"] = text

    return result

def detect_circles_from_contours(
    contours,
    sx: float,
    sy: float,
    min_area: int = 300,
    min_radius_px: float = 5.0,
    circularity_thresh: float = 0.75
):
    circles = []
    scale = (sx + sy) / 2.0

    for c in contours:
        area = cv2.contourArea(c)
        if area < min_area:
            continue

        peri = cv2.arcLength(c, True)
        if peri < 20:
            continue

        circularity = 4 * math.pi * area / (peri * peri)
        if circularity < circularity_thresh:
            continue

        (x, y), r_px = cv2.minEnclosingCircle(c)
        if r_px < min_radius_px:
            continue

        r_mm = r_px / scale

        circles.append({
            "center_px": (int(x), int(y)),
            "radius_px": float(r_px),
            "radius_mm": float(r_mm),
            "diameter_mm": float(2 * r_mm),
        })

    return circles

def contour_is_circle(contour, min_circularity=0.75):
    area = cv2.contourArea(contour)
    if area < 300:
        return False

    peri = cv2.arcLength(contour, True)
    if peri == 0:
        return False

    circularity = 4 * math.pi * area / (peri * peri)
    return circularity >= min_circularity

def deduplicate_circles(circles, center_tol_px=10, radius_tol_px=10):
    unique = []

    for c in circles:
        keep = True
        for u in unique:
            dc = math.hypot(
                c["center_px"][0] - u["center_px"][0],
                c["center_px"][1] - u["center_px"][1],
            )
            dr = abs(c["radius_px"] - u["radius_px"])

            if dc < center_tol_px and dr < radius_tol_px:
                keep = False
                break

        if keep:
            unique.append(c)

    return unique

def sort_analyze_image(
    bgr: np.ndarray,
    tcp: list,
    static_point_px=(640, 480),
    minarea=2000,
    white_thresh=150,
    auto_thresh=True,
    enable_edges=False,
):
    gray_check = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray_check = cv2.GaussianBlur(gray_check, (5, 5), 0)

    if not object_present(gray_check):
        return {
        "success": False,
        "count": 0,
        "objects": [],
        "groups": [],
        "reason": "no object present"
    }
    # ------------------ PREPROCESS ------------------
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

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

    contours, hierarchy = cv2.findContours(
        mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return {"success": False, "reason": "no contours found"}

    # ------------------ FILTER OBJECTS ------------------
    objects = filter_object_contours(contours, min_area=minarea)

    if not objects:
        return {"success": False, "reason": "no valid objects"}

    # ------------------ SCALE ------------------
    z = tcp[2]
    sx = scale_calculation(z)
    sy = scale_calculation_y(z)

    ax, ay = static_point_px
    Rz = tcp[5]

    results = []

    # ------------------ PROCESS EACH OBJECT ------------------
    for idx, subject in enumerate(objects):
        M = cv2.moments(subject)
        if M["m00"] == 0:
            continue

        cx = M["m10"] / M["m00"]
        cy = M["m01"] / M["m00"]

        # pixel → mm
        dx = cx - ax
        dy = cy - ay
        dx_mm = dx / sx
        dy_mm = dy / sy
        dist_mm = math.hypot(dx_mm, dy_mm)

        # orientation
        theta_vector = (math.degrees(math.atan2(-dy, dx)) + 360.0) % 360.0
        theta_rect, _, _, box = rect_orientation_deg(subject)
        theta_pca = pca_orientation_deg(subject)

        # robot transform
        a1 = math.radians(Rz - 45.0)
        a2 = math.radians(theta_vector + Rz - 45.0 - 90.0)

        p = 46.5 * math.cos(a1) + dist_mm * math.cos(a2)
        q = 46.5 * math.sin(a1) + dist_mm * math.sin(a2)

        target_x = tcp[0] + p
        target_y = tcp[1] + q

        target_Rz = Rz
        if theta_rect > 90:
            target_Rz = Rz + (180 - theta_rect)
        elif theta_rect < 90:
            target_Rz = Rz - theta_rect

        obj_result = {
            "center_px": [float(cx), float(cy)],
            "static_center_px": list(static_point_px),
            "contour_px": subject.reshape(-1, 2).astype(int).tolist(),
            "box_px": box.astype(int).tolist(),
            "theta_rect": theta_rect,
            "theta_pca": theta_pca,
            "distance_mm": dist_mm,
            "target": {
                "target_X": target_x,
                "target_Y": target_y,
                "target_Rz": target_Rz,
            },
        }
        # Always compute geometry for grouping
        measurements, approx_edges, _ = measure_edges_and_holes(
            [subject], sx, sy
        )

        obj_result["inspection"] = measurements


        # ------------------ INSPECTION ------------------
        if enable_edges:
            child_contours = get_child_contours(subject, contours, hierarchy)

            measurements = {}
            circles = []

            # ===============================
            # CASE 1: OBJECT ITSELF IS CIRCLE
            # ===============================
            if contour_is_circle(subject):
                (x, y), r_px = cv2.minEnclosingCircle(subject)
                r_mm = r_px / ((sx + sy) / 2)

                circles.append({
                    "center_px": [int(x), int(y)],
                    "radius_px": float(r_px),
                    "radius_mm": float(r_mm),
                    "diameter_mm": float(2 * r_mm),
                })

                # Keep existing geometry and just add circles
                obj_result["inspection"]["circles"] = circles


            # ==================================
            # CASE 2: NON-CIRCULAR OBJECT
            # ==================================
            else:
                measurements, approx_edges, _ = measure_edges_and_holes(
                    [subject], sx, sy
                )

                # detect circular features inside
                for c in child_contours:
                    if not contour_is_circle(c):
                        continue

                    (x, y), r_px = cv2.minEnclosingCircle(c)
                    r_mm = r_px / ((sx + sy) / 2)

                    circles.append({
                        "center_px": [int(x), int(y)],
                        "radius_px": float(r_px),
                        "radius_mm": float(r_mm),
                        "diameter_mm": float(2 * r_mm),
                    })

                circles = deduplicate_circles(circles)

                obj_result["inspection"] = measurements
                obj_result["inspection"]["circles"] = circles

                obj_result["edges_px"] = approx_edges.reshape(-1, 2).astype(int).tolist()

        results.append(obj_result)

    # ------------------ SORT OBJECTS ------------------
    results.sort(key=lambda o: o["center_px"][0])

    # Re-assign ID after sorting
    for new_id, obj in enumerate(results, start=1):
        obj["id"] = new_id

    # Always group using computed geometry
    groups = group_objects_by_geometry(results)

    return {
        "success": True,
        "count": len(results),
        "objects": results,
        "groups": groups,
    }



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

def group_objects_by_geometry(
    objects,
    width_tol=0.08,
    height_tol=0.08,
    area_tol=0.12,
):
    global GROUP_REGISTRY, GROUP_COUNTER

    cycle_groups = []

    for obj in objects:

        width = obj["inspection"]["width_mm"]
        height = obj["inspection"]["height_mm"]
        area = obj["inspection"]["area_mm2"]

        matched_group = None

        # 🔍 Try match with existing registry
        for reg in GROUP_REGISTRY:
            ref = reg["ref"]

            if (
                within_tol(width, ref["width"], width_tol)
                and within_tol(height, ref["height"], height_tol)
                and within_tol(area, ref["area"], area_tol)
            ):
                matched_group = reg
                break

        # 🆕 If not found → create new stable group
        if not matched_group:
            GROUP_COUNTER += 1
            matched_group = {
                "group_id": f"G{GROUP_COUNTER}",
                "ref": {
                    "width": width,
                    "height": height,
                    "area": area
                }
            }
            GROUP_REGISTRY.append(matched_group)

        # 📦 Add object to cycle group
        group = next(
            (g for g in cycle_groups if g["group_id"] == matched_group["group_id"]),
            None
        )

        if not group:
            group = {
                "group_id": matched_group["group_id"],
                "ref": matched_group["ref"],
                "object_ids": [],
                "targets": []
            }
            cycle_groups.append(group)

        group["object_ids"].append(obj["id"])
        group["targets"].append(obj["target"])
    print("group:",cycle_groups)
    return cycle_groups



def within_tol(value, reference, tol):
    if reference == 0:
        return False
    return abs(value - reference) <= reference * tol


def set_priority_for_groups(analysis: dict, priority_order: list):

    if not analysis.get("success"):
        return []

    groups = analysis.get("groups", [])
    objects = analysis.get("objects", [])

    # Map object_id → full object data
    object_map = {obj["id"]: obj for obj in objects}

    ordered_objects = []

    # 1️⃣ Follow user priority
    for gid in priority_order:
        group = next((g for g in groups if g["group_id"] == gid), None)
        if not group:
            continue

        for obj_id in group["object_ids"]:
            if obj_id in object_map:
                ordered_objects.append(object_map[obj_id])

    # 2️⃣ Add remaining objects (if any group missing)
    used_ids = {obj["id"] for obj in ordered_objects}

    for obj in objects:
        if obj["id"] not in used_ids:
            ordered_objects.append(obj)

    return ordered_objects
