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
from fastapi import FastAPI
from app.api.v1.api import api_router
from app.db.base import Base
from app.db.session import engine

app = FastAPI(title="Async FastAPI CRUD")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(api_router)
