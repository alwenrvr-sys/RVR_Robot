import tempfile
import os
import threading
from app.schemas.item import AutoPickPlaceStartResponse,AutoPickPlaceStopResponse,AutoPickPlaceStatusResponse,DXFPreviewResponse,DXFDrawRequest,DXFDrawResponse,PriorityRequest
from app.Applications.PickAndPlace import AUTO_RESULT, AUTO_RUN, PickAndPlace,StopPickAndPlace
from app.Applications.PickAndSort import AUTO_RESULT, AUTO_RUN, PickAndSort,StopPickAndSort
from app.robot.Helpers import set_priority_for_groups
from app.Applications.ReadandDraw import load_dxf,scale_paths_to_a4
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.robot.Robot import get_robot

robot = get_robot()

router = APIRouter(prefix="/app", tags=["Application"])

_DXF_CACHE = {
    "paths": None
}

@router.post("/1-start", response_model=AutoPickPlaceStartResponse)
def start_pick_place():
    PickAndPlace()
    return {
        "success": True,
        "message": "Auto Pick & Place started",
        "auto_run": True,
    }

@router.post("/1-stop", response_model=AutoPickPlaceStopResponse)
def stop_pick_place():
    StopPickAndPlace()
    return {
        "success": True,
        "message": "Auto Pick & Place stopped",
        "auto_run": False,
    }

@router.get("/1-status", response_model=AutoPickPlaceStatusResponse)
def status_pick_place():
    return {
        **AUTO_RESULT,
        "auto_run": AUTO_RUN,
    }

@router.post("/2-start", response_model=AutoPickPlaceStartResponse)
def start_pick_sort():
    PickAndSort()
    return {
        "success": True,
        "message": "Auto Pick & Sort started",
        "auto_run": True,
    }

@router.post("/2-stop", response_model=AutoPickPlaceStopResponse)
def stop_pick_sort():
    StopPickAndSort()
    return {
        "success": True,
        "message": "Auto Pick & Sort stopped",
        "auto_run": False,
    }

@router.get("/2-status", response_model=AutoPickPlaceStatusResponse)
def status_pick_sort():
    return {
        **AUTO_RESULT,
        "auto_run": AUTO_RUN,
    }

@router.post("/preview", response_model=DXFPreviewResponse)
def preview_dxf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".dxf"):
        raise HTTPException(400, "Only DXF files allowed")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".dxf") as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name
    try:
        raw_paths = load_dxf(tmp_path)
        scaled_paths = scale_paths_to_a4(raw_paths)

        _DXF_CACHE["paths"] = scaled_paths
        return {
            "success": True,
            "paths": scaled_paths,
        }
    except Exception as e:
        raise HTTPException(500, str(e))
    finally:
        os.remove(tmp_path)

@router.post("/draw", response_model=DXFDrawResponse)
def draw_dxf(req: DXFDrawRequest):
    paths = _DXF_CACHE.get("paths")
    if not paths:
        raise HTTPException(
            status_code=400,
            detail="No DXF loaded. Upload & preview DXF first."
        )

    threading.Thread(
        target=_draw_worker,
        args=(paths, req),
        daemon=True
    ).start()

    return {
        "success": True,
        "message": "DXF draw started",
        "path_count": len(paths),
        "paths": [
            [
                (req.origin_x + x, req.origin_y + y)
                for x, y in path
            ]
            for path in paths
        ]
    }


def safe_move_api(
    x: float,
    y: float,
    z: float,
    rx: float,
    ry: float,
    rz: float,
    z_lift: float = 0.0,
    simulate: bool = False
):
    # -------- target pose --------
    target = [x, y, z, rx, ry, rz]

    err, cur_tcp = robot.get_tcp()
    if err != 0:
        raise RuntimeError("Failed to get TCP")

    # -------- via pose --------
    via = target[:]
    via[2] += z_lift

    # -------- IK CHECK --------
    ret_t, ik_t = robot.ik(target)
    ret_v, ik_v = robot.ik(via)
    if ret_t != 0 or ret_v != 0:
        raise RuntimeError("IK failed")

    # -------- normalize IK joints --------
    def normalize_joints(ik):
        if isinstance(ik, (list, tuple)):
            if len(ik) == 6:
                return list(ik)
            if len(ik) >= 7:
                return list(ik[1:7])
        raise RuntimeError(f"Invalid IK result: {ik}")

    jt = normalize_joints(ik_t)
    jv = normalize_joints(ik_v)

    # -------- SOFT LIMIT CHECK --------
    limits = robot.get_joint_soft_limits_deg()  # ← 12 floats

    for i in range(6):
        lo = limits[i * 2]
        hi = limits[i * 2 + 1]
        if not (lo <= jv[i] <= hi):
            raise RuntimeError(
                f"Joint {i+1} limit exceeded: "
                f"{jv[i]:.2f} not in [{lo:.2f}, {hi:.2f}]"
            )

    # -------- SIMULATION --------
    if simulate and hasattr(robot, "sim_move_l"):
        robot.sim_move_l(cur_tcp, 1)
        robot.sim_move_l(via, 2)
        robot.sim_move_l(target, 3)

    # -------- REAL MOTION --------
    ret = robot.move_l(via)
    if ret != 0:
        raise RuntimeError(f"MoveL via failed: {ret}")

    ret = robot.move_l(target)
    if ret != 0:
        raise RuntimeError(f"MoveL target failed: {ret}")


def _draw_worker(paths, req):
    try:

        for path in paths:
            if len(path) < 2:
                continue

            sx, sy = path[0]

            # ---- move above start (TRAVEL Z) ----
            safe_move_api(
                req.origin_x + sx,
                req.origin_y + sy,
                req.travel_z,
                req.rx,
                req.ry,
                req.rz
            )

            # ---- move down to DRAW Z ----
            safe_move_api(
                req.origin_x + sx,
                req.origin_y + sy,
                req.draw_z,
                req.rx,
                req.ry,
                req.rz
            )

            # ---- draw path ----
            for x, y in path:
                safe_move_api(
                    req.origin_x + x,
                    req.origin_y + y,
                    req.draw_z,
                    req.rx,
                    req.ry,
                    req.rz
                )

            # ---- lift up at end ----
            ex, ey = path[-1]
            safe_move_api(
                req.origin_x + ex,
                req.origin_y + ey,
                req.travel_z,
                req.rx,
                req.ry,
                req.rz
            )

    except Exception as e:
        print("DXF draw error:", e)

@router.post("/set-priority")
def set_priority(req: PriorityRequest):
    global AUTO_RESULT
    AUTO_RESULT["priority_order"] = req.priority
    return {
        "success": True,
        "priority_order": AUTO_RESULT["priority_order"]
    }