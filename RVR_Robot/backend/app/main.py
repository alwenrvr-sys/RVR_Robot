# this is sync 
# from fastapi import FastAPI
# from app.api.v1.api import api_router
# from app.db.session import engine
# from app.db.base import Base

# app = FastAPI(title="Professional FastAPI CRUD")

# Base.metadata.create_all(bind=engine)

# app.include_router(api_router)

# @app.get("/")
# def root():
#     return {"status": "FastAPI running"}

# this is async
# from fastapi import FastAPI
# from app.api.v1.api import api_router
# from app.db.base import Base
# from app.db.session import engine

# app = FastAPI(title="Async FastAPI CRUD")

# @app.on_event("startup")
# async def startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

# app.include_router(api_router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.db.base import Base
from app.db.session import engine
from app.models.object_image import ObjectImage
from app.models.object_group import ObjectGroup

app = FastAPI(title="Async FastAPI CRUD")

# --- CORS Configuration ---
# This allows your React frontend (port 3000) to communicate with this API
origins = [
    "http://localhost:3000",    # React default port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],        # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],        # Allows all headers (Content-Type, Authorization, etc.)
)

# --- Startup Events ---
@app.on_event("startup")
async def startup():
    """
    Creates database tables on startup if they don't exist.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- Routes ---
# This includes all the routes defined in your api/v1/api.py
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "API is running and CORS is enabled"}
