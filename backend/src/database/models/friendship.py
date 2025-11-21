from sqlalchemy import Column, Integer

from .base import Base

class Friendship(Base):
    __tablename__ = "friendship"

    user_id = Column(Integer, primary_key=True)
    friend_id = Column(Integer, primary_key=True)
