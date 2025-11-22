from sqlalchemy import Column, Integer, String, Text, DateTime 
from .base import Base

DEFAULT_COMM_AVATAR = ""

class Community(Base):
    __tablename__ = "communnities"

    com_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="Пока что пусто...")
    creator_id = Column(Integer)
    avatar_url = Column(String, default=DEFAULT_COMM_AVATAR)
    created_at = Column(DateTime)