from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict, Any

Point2D = Tuple[float, float]

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

class DetectedObject(BaseModel):
    id: int
    center_px: Tuple[float, float]
    static_center_px: Tuple[int, int]
    contour_px: List[Tuple[int, int]]
    box_px: List[Tuple[int, int]]
    theta_rect: float
    theta_pca: float
    distance_mm: float
    target: Dict[str, float]
    edges_px: Optional[List[Tuple[int, int]]] = None
    inspection: Optional[Dict[str, Any]] = None

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
    center_px: Optional[Tuple[float, float]] = None
    static_center_px: Optional[Tuple[int, int]] = None
    contour_px: Optional[List[Tuple[int, int]]] = None
    box_px: Optional[List[Tuple[int, int]]] = None
    edges_px: Optional[List[Tuple[int, int]]] = None
    distance_mm: Optional[float] = None
    theta_rect: Optional[float] = None
    theta_pca: Optional[float] = None
    target: Optional[Dict[str, float]] = None
    inspection: Optional[Dict[str, Any]] = None
    ocr: Optional[str] = None
    reason: Optional[str] = None

class AllAnalyzeImageResponse(BaseModel):
    success: bool
    count: int
    objects: List[DetectedObject]
    reason: Optional[str] = None

class AutoPickPlaceStartRequest(BaseModel):
    pass

class AutoPickPlaceStartResponse(BaseModel):
    success: bool
    message: str
    auto_run: bool
    
class AutoPickPlaceStopRequest(BaseModel):
    pass

class AutoPickPlaceStopResponse(BaseModel):
    success: bool
    message: str
    auto_run: bool

class AutoPickPlaceStatusResponse(BaseModel):
    success: Optional[bool] = None
    stage: str                      # <-- NEW
    image_base64: Optional[str] = None
    analysis: Optional[dict] = None
    target_pose: Optional[List[float]] = None
    tcp: Optional[List[float]] = None
    error: Optional[str] = None
    auto_run: bool

class DXFPreviewResponse(BaseModel):
    success: bool
    paths: List[List[Point2D]]   
    width_mm: float = 148.0
    height_mm: float = 210.0

class DXFDrawRequest(BaseModel):
    origin_x: float
    origin_y: float
    draw_z: float = 160.0
    travel_z: float = 170.0
    rx: float = 180.0
    ry: float = 0.0
    rz: float = 45.0

class DXFDrawResponse(BaseModel):
    success: bool
    message: str
    path_count: int
    paths: List[List[Point2D]]