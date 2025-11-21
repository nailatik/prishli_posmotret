from sqlalchemy import Column, Integer, String

from .base import Base

class friendship(Base):
    __tablename__ = "friendship"

    user_id = Column(Integer)
    firend_id = Column(Integer)
