from sqlalchemy import Column, Integer, String

from .base import Base

class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    content = Column(String, nullable=False)
    picture = Column(String)

