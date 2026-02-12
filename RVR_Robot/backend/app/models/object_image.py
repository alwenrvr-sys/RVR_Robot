from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class ObjectImage(Base):
    __tablename__ = "object_images"

    id = Column(Integer, primary_key=True, index=True)

    group_id = Column(Integer, ForeignKey("object_groups.id"), nullable=False)
    image_path = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("ObjectGroup")
