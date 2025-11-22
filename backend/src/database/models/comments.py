from sqlalchemy import Column, Integer, String, Text
from .base import Base

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True)
    post_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)

