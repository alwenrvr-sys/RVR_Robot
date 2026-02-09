import asyncio
import time
import os
import cv2
from typing import Optional
from app.robot.Camera import SickCamera
from app.robot.Helpers import scale_calculation,scale_calculation_y,image_to_base64
from typing import Optional, Dict

FTP_IMAGE_DIR = r"C:\ftp_root\nova"
SUPPORTED_EXTS = (".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff")
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

def get_latest_image_path(directory: str) -> Optional[str]:
    files = [
        os.path.join(directory, f)
        for f in os.listdir(directory)
        if f.lower().endswith(SUPPORTED_EXTS)
    ]
    if not files:
        return None
    return max(files, key=os.path.getmtime)


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

async def run_camera_autosetup():
    camera = await get_camera()
    await asyncio.to_thread(camera.run_autosetup)

async def trigger_camera(current_z: float) -> Dict:
    camera = await get_camera()

    scale_x = scale_calculation(current_z)
    scale_y = scale_calculation_y(current_z)

    await asyncio.to_thread(camera.trigger_with_autosetup, current_z)
    await asyncio.sleep(0.3)

    img_path = await asyncio.to_thread(get_latest_image_path, FTP_IMAGE_DIR)
    if img_path is None:
        raise RuntimeError("No image files found")

    ready = await asyncio.to_thread(wait_for_image_ready, img_path)
    if not ready:
        raise RuntimeError("Image not ready")

    img = await asyncio.to_thread(cv2.imread, img_path)
    if img is None:
        raise RuntimeError("Image decode failed")

    img_b64 = image_to_base64(img)

    return {
        "z": current_z,
        "scale_x_px_per_mm": scale_x,
        "scale_y_px_per_mm": scale_y,
        "image_base64": img_b64
    }



async def close_camera():
    global _camera
    if _camera:
        await asyncio.to_thread(_camera.close)
        _camera = None
