from ..Camera_setup import SickCamera

CAMERA_IP = "192.168.58.67"
CAMERA_PORT = 2114

_camera = None


def get_camera():
    global _camera
    if _camera is None:
        _camera = SickCamera(CAMERA_IP, CAMERA_PORT)
        _camera.connect()
    return _camera


def close_camera():
    global _camera
    if _camera:
        _camera.close()
        _camera = None
