from sqlalchemy import Column, Integer, ForeignKey

from .base import Base

class Friendship(Base):
    __tablename__ = "friendship"

    user_id = Column(Integer, ForeignKey("user.user_id"), primary_key=True)
    friend_id = Column(Integer, ForeignKey("user.user_id"), primary_key=True)
