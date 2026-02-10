import threading
from app.sdk.fairino.Robot import RPC
import time

ROBOT_IP = "192.168.58.2"

MOVE_VEL = 80   
MOVE_ACC = 50    
OVL = 100.0       

class RobotService:
    def __init__(self):
        self.robot = RPC(ROBOT_IP)
        self.lock = threading.Lock()

    def call(self, name, *args):
        with self.lock:
            return getattr(self.robot, name)(*args)

#---------CONNECTION------------
    def is_connected(self):
        return not self.robot.reconnect_flag

#--------GET-CURRENT-POSE-------
    def get_tcp(self):
        with self.lock:
            return self.robot.GetActualTCPPose()
    
#---------GET_JOINTS---------
    def get_joints_deg(self):
        with self.lock:
            return self.robot.GetActualJointPosDegree()
    
#--------ACTIONS---------
    def set_mode(self, mode: int):
        mode = int(mode)
        if mode not in (0, 1):
            raise ValueError("mode must be 0 (AUTO) or 1 (MANUAL)")
        return self.call("Mode", mode)

    def robot_enable(self, enable: int):
        enable = int(enable)
        if enable not in (0, 1):
            raise ValueError("enable must be 0 (disable) or 1 (enable)")
        return self.call("RobotEnable", enable)

    def reset_errors(self):
        return self.call("ResetAllError")

    def stop(self):
        return self.call("StopMove")
            
#----------HELPERS-----------
    def ik(self, pose, config: int = -1):
        pose = list(map(float, pose))
        config = int(config)
        return self.call("GetInverseKin", 0, pose, config)

    def get_do(self):
        return 0, [
            self.robot.robot_state_pkg.cl_dgt_output_h,
            self.robot.robot_state_pkg.cl_dgt_output_l,
        ]

    def set_do(self, io_id: int, status: int, smooth: int = 0, block: int = 0):
        io_id = int(io_id)
        status = int(status)
        smooth = int(smooth)
        block = int(block)

        if not (0 <= io_id <= 15):
            raise ValueError("io_id must be in range 0~15")
        if status not in (0, 1):
            raise ValueError("status must be 0 (OFF) or 1 (ON)")
        if smooth not in (0, 1):
            raise ValueError("smooth must be 0 or 1")
        if block not in (0, 1):
            raise ValueError("block must be 0 or 1")

        return self.call("SetDO", io_id, status, smooth, block)

#-------------INSTALL-ANGLE---------------- 
    def get_robot_install_angle(self):
        return self.call("GetRobotInstallAngle")

#-------------MOVEMENTS------------
    def move_l(self, pose):
        pose = list(map(float, pose))

        return self.call(
            "MoveL",
            pose,                      # desc_pos
            0,                      # tool
            0,                      # user
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],  # joint_pos → let SDK solve IK
            MOVE_VEL,                  # vel (%)
            MOVE_ACC,                  # acc (%)
            OVL,                       # ovl (%)
            -1,                # blendR (-1 = stop)
            0,                         # blendMode
            [0.0, 0.0, 0.0, 0.0],      # exaxis_pos
            0,                         # search
            0,                         # offset_flag
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],  # offset_pos
            -1,                        # config
            0,                         # velAccParamMode (percentage)
            0,                         # overSpeedStrategy
            10                         # speedPercent
        )


#-------------SPEED----------------
    @staticmethod
    def get_motion_params():
        return {
            "vel": MOVE_VEL,
            "acc": MOVE_ACC,
            "ovl": OVL,
        }

    @staticmethod
    def set_motion_params(vel=None, acc=None, ovl=None):
        global MOVE_VEL, MOVE_ACC, OVL

        if vel is not None:
            vel = float(vel)
            if not (0 <= vel <= 100):
                raise ValueError("vel must be 0~100")
            MOVE_VEL = vel

        if acc is not None:
            acc = float(acc)
            if not (0 <= acc <= 100):
                raise ValueError("acc must be 0~100")
            MOVE_ACC = acc

        if ovl is not None:
            ovl = float(ovl)
            if not (0 <= ovl <= 100):
                raise ValueError("ovl must be 0~100")
            OVL = ovl

    def get_tcp_speed(self):
        return 0, [
            self.robot.robot_state_pkg.actual_TCP_Speed[0],
            self.robot.robot_state_pkg.actual_TCP_Speed[1],
            self.robot.robot_state_pkg.actual_TCP_Speed[2],
            self.robot.robot_state_pkg.actual_TCP_Speed[3],
            self.robot.robot_state_pkg.actual_TCP_Speed[4],
            self.robot.robot_state_pkg.actual_TCP_Speed[5],
        ]

#------------------PICK AND UNPICK-------------

    def pick_unpick(self) -> dict:
        err, (do_h, do_l) = self.get_do()
        if err != 0:
            raise RuntimeError("GetDO failed")

        current = (do_l >> 0) & 1
        new = 0 if current == 1 else 1
        self.set_do(0, new)
        time.sleep(0.05)
        err2, (_, do_l_after) = self.get_do()
        if err2 != 0:
            raise RuntimeError("GetDO confirm failed")

        confirmed = (do_l_after >> 0) & 1

        return {
            "success": confirmed == new,
            "previous": current,
            "current": confirmed,
        }

#-------------HELPERS-------------
    def _errcode(self, ret):
        if isinstance(ret, (list, tuple)):
            return int(ret[0])
        return int(ret)

    def set_plan_preview_l(self, a, c, b, sim_errcodes=None):
        def dist_mm(p1, p2):
            return ((p1[0]-p2[0])**2 +
                    (p1[1]-p2[1])**2 +
                    (p1[2]-p2[2])**2) ** 0.5
        preview = {
            "A_tcp": [round(v, 3) for v in a],
            "C_tcp": [round(v, 3) for v in c],
            "B_tcp": [round(v, 3) for v in b],
            "distance_mm": {
                "A_to_C": round(dist_mm(a, c), 2),
                "C_to_B": round(dist_mm(c, b), 2),
                "total": round(dist_mm(a, c) + dist_mm(c, b), 2),
            }
        }
        if sim_errcodes is not None:
            preview["sim_move_l_errcodes"] = sim_errcodes
        return preview

    def sim_move_l(self, pose, sim_flag=1):
        if len(pose) != 6:
            raise ValueError("pose must be [x,y,z,rx,ry,rz]")
        pose = list(map(float, pose))
        sim_flag = int(sim_flag)
        with self.lock:
            return self.robot.SimMoveL(
                pose[0], pose[1], pose[2],      # x y z
                pose[3], pose[4], pose[5],      # rx ry rz
                0,                              # toolNum
                0,                              # workPieceNum
                MOVE_VEL,                       # speed
                MOVE_ACC,                       # acc
                int(OVL),                       # ovl
                -1,                             # blendR
                0.0, 0.0, 0.0, 0.0,             # exaxis 1~4
                0,                              # search_flag
                0,                              # offset_flag
                0.0, 0.0, 0.0,                  # dt_x dt_y dt_z
                0.0, 0.0, 0.0,                  # dt_rx dt_ry dt_rz
                MOVE_ACC,                       # oacc
                sim_flag                        # simFlag
            )
            
    def move_to_pose_l(self, target_pose,z_lift=0.0, simulate=True):
        try:
            if len(target_pose) != 6:
                raise ValueError("target_pose must be [x,y,z,rx,ry,rz]")

            # ---- Read current TCP (A) ----
            err, cur_pose = self.get_tcp()
            if err != 0:
                raise RuntimeError("Failed to read current TCP")

            # ---- Build Z-lift waypoint C ----
            via_pose = list(target_pose)
            via_pose[2] += float(z_lift)

            # ---- IK reachability check ----
            ret_c, joints_c = self.ik(via_pose)
            ret_b, joints_b = self.ik(target_pose)

            if ret_c != 0 or ret_b != 0:
                raise RuntimeError("IK failed (pose unreachable)")

            sim_codes = None

            # ---- SimMoveL A → C → B ----
            if simulate and hasattr(self.robot, "SimMoveL"):
                e1 = self._errcode(self.sim_move_l(cur_pose, 1))
                e2 = self._errcode(self.sim_move_l(via_pose, 2))
                e3 = self._errcode(self.sim_move_l(target_pose, 3))

                sim_codes = {"A": e1, "C": e2, "B": e3}

                if e1 != 0 or e2 != 0 or e3 != 0:
                    raise RuntimeError(f"SimMoveL failed: {sim_codes}")

            # ---- Execute real MoveL ----
            self.move_l(via_pose)
            time.sleep(0.05)
            self.move_l(target_pose)

            return {
                "success": True,
                "A": cur_pose,
                "C": via_pose,
                "B": target_pose,
                "z_lift": z_lift,
                "joints": {
                    "C": joints_c,
                    "B": joints_b,
                },
                "sim_codes": sim_codes,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
            
    def get_joint_soft_limits_deg(self):
        """
        Returns joint soft limits in degrees:
        [
        j1_min, j1_max,
        j2_min, j2_max,
        j3_min, j3_max,
        j4_min, j4_max,
        j5_min, j5_max,
        j6_min, j6_max
        ]
        """
        with self.lock:
            err, limits = self.robot.GetJointSoftLimitDeg()

        if err != 0 or limits is None:
            raise RuntimeError("Failed to get joint soft limits")

        if len(limits) != 12:
            raise RuntimeError("Invalid joint soft limit data")

        return limits
