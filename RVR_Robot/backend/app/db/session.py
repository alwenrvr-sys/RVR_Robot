#  use a sql lite 
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker

# DATABASE_URL = "sqlite:///./test.db"

# engine = create_engine(
#     DATABASE_URL, connect_args={"check_same_thread": False}
# )

# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# this is sync db only
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker

# DATABASE_URL = (
#     "postgresql+psycopg2://postgres:RVRtech%40123@localhost:5432/testFastApi"
# )

# engine = create_engine(
#     DATABASE_URL,
#     pool_pre_ping=True   # important for postgres stability
# )

# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# this is async db
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession
)
from sqlalchemy.orm import sessionmaker

DATABASE_URL = (
    "postgresql+asyncpg://postgres:RVRtech%40123@localhost:5432/testFastApi"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=False
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
