from pydantic import BaseModel
from typing import List
from typing import Optional

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