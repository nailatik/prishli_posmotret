from sqlalchemy import Column, Integer, ForeignKey

from .base import Base

class PostTag(Base):
    __tablename__ = "post_tags"
    post_id = Column(Integer, ForeignKey("posts.post_id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.tag_id"), primary_key=True)