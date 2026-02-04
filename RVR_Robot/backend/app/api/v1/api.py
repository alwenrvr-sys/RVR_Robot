from fastapi import APIRouter
from app.api.v1.endpoints import item,auth

api_router = APIRouter()
api_router.include_router(item.router, prefix="/items", tags=["Items"])
api_router.include_router(
    auth.router
)