from sqlalchemy import Column, Integer

from .base import Base

class Like(Base):
    __tablename__ = "likes"

    user_id = Column(Integer, primary_key=True)
    post_id = Column(Integer, primary_key=True)
