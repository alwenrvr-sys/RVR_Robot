import asyncio
from typing import Optional
from app.robot.Camera import SickCamera

# Singleton camera instance (one TCP connection)
_camera: Optional[SickCamera] = None

CAMERA_IP = "192.168.58.67"
CAMERA_PORT = 2114


async def get_camera() -> SickCamera:
    global _camera
    if _camera is None:
        _camera = SickCamera(CAMERA_IP, CAMERA_PORT)
        await asyncio.to_thread(_camera.connect)
    return _camera


async def trigger_camera(current_z: float):
    camera = await get_camera()

    await asyncio.to_thread(
        camera.trigger_with_autosetup,
        current_z
    )

    return {
        "status": "ok",
        "message": "Camera triggered",
        "z": current_z
    }


async def close_camera():
    global _camera
    if _camera:
        await asyncio.to_thread(_camera.close)
        _camera = None
