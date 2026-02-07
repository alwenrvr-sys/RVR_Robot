from fastapi import APIRouter, HTTPException
from app.robot.Robot_service import RobotService
from app.robot.Robot import get_robot
from app.schemas.item import TcpPose,RobotInstallAngle,MotionParams,MoveLRequest

router = APIRouter(prefix="/robot", tags=["Robot"])

robot = get_robot()

#---------CONNECTION---------
@router.get("/ping")
def robot_connected():
    return {
        "connected": not robot.robot.reconnect_flag
    }

# -------- MODE --------
@router.get("/mode/auto")
def set_auto_mode():
    try:
        robot.set_mode(0)
        return {"status": "ok", "mode": "AUTO", "value": 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mode/manual")
def set_manual_mode():
    try:
        robot.set_mode(1)
        return {"status": "ok", "mode": "MANUAL", "value": 1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------- ENABLE / DISABLE --------
@router.get("/enable")
def enable_robot():
    try:
        robot.robot_enable(1)
        return {"status": "ok", "robot": "ENABLED", "value": 1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/disable")
def disable_robot():
    try:
        robot.robot_enable(0)
        return {"status": "ok", "robot": "DISABLED", "value": 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------- SAFETY --------
@router.get("/stop")
def stop_robot():
    try:
        robot.stop()
        return {"status": "ok", "action": "STOP"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reset")
def reset_errors():
    try:
        robot.reset_errors()
        return {"status": "ok", "action": "ERRORS RESET"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#------GET-CURRENT-POSE-------
@router.get("/tcp", response_model=TcpPose)
def get_tcp():
    try:
        err, tcp = robot.get_tcp()
        if err != 0:
            raise RuntimeError(f"Robot error code: {err}")
        return {
            "x": tcp[0],
            "y": tcp[1],
            "z": tcp[2],
            "rx": tcp[3],
            "ry": tcp[4],
            "rz": tcp[5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#---------GET_JOINTS_VALUE_DEG-------------
@router.get("/joints")
def get_joints():
    try:
        result = robot.get_joints_deg()
        if isinstance(result, (tuple, list)) and len(result) == 2:
            err, joints = result
            if int(err) != 0:
                raise RuntimeError(f"Robot error code: {err}")
        else:
            joints = result
        return {
            "j1": joints[0],
            "j2": joints[1],
            "j3": joints[2],
            "j4": joints[3],
            "j5": joints[4],
            "j6": joints[5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#--------------SPEED------------
@router.get("/tcp-speed")
def get_tcp_speed():
    try:
        err, speed = robot.get_tcp_speed()
        if err != 0:
            raise RuntimeError(f"Robot error code: {err}")
        return {
            "vx": speed[0],
            "vy": speed[1],
            "vz": speed[2],
            "vrx": speed[3],
            "vry": speed[4],
            "vrz": speed[5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/motion-params")
def get_params():
    return RobotService.get_motion_params()

@router.post("/motion-params")
def set_params(params: MotionParams):
    RobotService.set_motion_params(
        vel=params.vel,
        acc=params.acc,
        ovl=params.ovl,
    )
    return {
        "status": "ok",
        "params": RobotService.get_motion_params()
    }
#--------------MOVEMENT----------------
@router.post("/moveL")
def move_l(req: MoveLRequest):
    try:
        if len(req.pose) != 6:
            raise ValueError("pose must have 6 values [x,y,z,rx,ry,rz]")

        error = robot.move_l(req.pose)
        if error != 0:
            raise RuntimeError(f"MoveL failed with error code: {error}")

        return {
            "status": "ok",
            "motion": "MoveL",
            "pose": req.pose
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#--------------INSTALL-ANGLE------------
@router.get("/install-angle", response_model=RobotInstallAngle)
def get_robot_install_angle():
    try:
        err, angles = robot.get_robot_install_angle()
        if err != 0:
            raise RuntimeError(f"Robot error code: {err}")
        return {
            "yangle": angles[0],
            "zangle": angles[1],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#--------------------PICK AND UNPICK-----------------
@router.get("/pick-unpick")
def pick_unpick():
    try:
        return robot.pick_unpick() 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))