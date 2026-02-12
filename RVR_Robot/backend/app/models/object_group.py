from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class ObjectGroup(Base):
    __tablename__ = "object_groups"

    id = Column(Integer, primary_key=True, index=True)

    group_code = Column(String, unique=True, nullable=False)
    label = Column(String, nullable=False, default="unknown")

    ref_width = Column(Float, nullable=False)
    ref_height = Column(Float, nullable=False)
    ref_area = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
