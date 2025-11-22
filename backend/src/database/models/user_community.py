from sqlalchemy import Column, Integer
from .base import Base

class UserCommunity(Base):
    __tablename__ = "user_community"

    user_id = Column(Integer, primary_key=True)
    community_id = Column(Integer, primary_key=True)

