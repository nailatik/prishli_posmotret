from sqlalchemy import Column, Integer, ForeignKey

from .base import Base

class Like(Base):
    __tablename__ = "likes"

    user_id = Column(Integer, ForeignKey("user.user_id"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"), primary_key=True)
