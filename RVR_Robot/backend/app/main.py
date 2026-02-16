from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.api import api_router
from app.db.base import Base
from app.db.session import engine
from app.ML.Ml_Service import DATASET_ROOT

app = FastAPI(title="Async FastAPI CRUD")

# --- CORS ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/dataset",
    StaticFiles(directory=str(DATASET_ROOT)),
    name="dataset",
)

# --- Startup ---
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- Routes ---
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "API is running and CORS is enabled"}
