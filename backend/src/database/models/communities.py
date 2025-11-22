from sqlalchemy import Column, Integer, String, Text
from .base import Base

class Community(Base):
    __tablename__ = "communities"

    community_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    avatar = Column(String, nullable=True)

