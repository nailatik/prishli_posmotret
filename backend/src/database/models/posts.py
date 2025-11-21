from sqlalchemy import Column, Integer, String

from .base import Base

class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    picture = Column(String, nullable=True, default=None)
    likes_count = Column(Integer, default=0, nullable=False)

