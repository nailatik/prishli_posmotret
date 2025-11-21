from sqlalchemy import Column, Integer

from .base import Base

class PostTag(Base):
    __tablename__ = "post_tags"

    post_id = Column(Integer, primary_key=True)
    tag_id = Column(Integer, primary_key=True)