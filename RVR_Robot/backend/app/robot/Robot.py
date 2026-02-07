from app.robot.Robot_service import RobotService

_robot_instance = None

def get_robot():
    global _robot_instance
    if _robot_instance is None:
        _robot_instance = RobotService()
    return _robot_instance
