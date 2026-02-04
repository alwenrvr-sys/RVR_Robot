import threading
from app.sdk.fairino.Robot import RPC

ROBOT_IP = "192.168.58.2"

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


#-------------SPEED----------------
    def get_tcp_speed(self):
        return 0, [
            self.robot.robot_state_pkg.actual_TCP_Speed[0],
            self.robot.robot_state_pkg.actual_TCP_Speed[1],
            self.robot.robot_state_pkg.actual_TCP_Speed[2],
            self.robot.robot_state_pkg.actual_TCP_Speed[3],
            self.robot.robot_state_pkg.actual_TCP_Speed[4],
            self.robot.robot_state_pkg.actual_TCP_Speed[5],
        ]
