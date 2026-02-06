from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict, Any

class ItemCreate(BaseModel):
    name: str
    description: str

class ItemResponse(ItemCreate):
    id: int

    class Config:
        from_attributes = True



class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class UserUsernameResponse(BaseModel):
    username: str

    class Config:
        from_attributes = True

class CameraTriggerRequest(BaseModel):
    current_z: float

class CameraTriggerResponse(BaseModel):
    status: str
    message: str
    z: float
    scale_x_px_per_mm: float
    scale_y_px_per_mm: float
    image_base64: str


class TcpPose(BaseModel):
    x: float
    y: float
    z: float
    rx: float
    ry: float
    rz: float

class ModeRequest(BaseModel):
    mode: int  

class EnableRequest(BaseModel):
    enable: int 
    
class RobotInstallAngle(BaseModel):
    yangle: float
    zangle: float

class MotionParams(BaseModel):
    vel: Optional[float]
    acc: Optional[float]
    ovl: Optional[float]

class MoveLRequest(BaseModel):
    pose: List[float]  # [x, y, z, rx, ry, rz]


class AnalyzeImageRequest(BaseModel):
    image_base64: str              # frontend sends base64 image
    tcp: List[float]               # [x,y,z,rx,ry,rz]

    white_thresh: int = 150
    auto_thresh: bool = True
    enable_edges: bool = False
    enable_ocr: bool = False
    ocr_roi: Optional[Tuple[int, int, int, int]] = None
    
class AnalyzeImageResponse(BaseModel):
    success: bool

    # ---------- PIXEL GEOMETRY ----------
    center_px: Optional[Tuple[float, float]] = None
    static_center_px: Optional[Tuple[int, int]] = None

    contour_px: Optional[List[Tuple[int, int]]] = None
    box_px: Optional[List[Tuple[int, int]]] = None
    edges_px: Optional[List[Tuple[int, int]]] = None

    # ---------- METRICS ----------
    distance_mm: Optional[float] = None
    theta_rect: Optional[float] = None
    theta_pca: Optional[float] = None

    # ---------- ROBOT ----------
    target: Optional[Dict[str, float]] = None

    # ---------- INSPECTION ----------
    inspection: Optional[Dict[str, Any]] = None

    # ---------- OCR ----------
    ocr: Optional[str] = None

    reason: Optional[str] = None

