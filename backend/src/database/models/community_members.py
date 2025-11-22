from sqlalchemy import Column, Integer
from .base import Base

class CommunityMember(Base):
    __tablename__ = "community_members"

    community_id = Column(Integer, nullable=False, primary_key=True)
    user_id = Column(Integer, nullable=False, primary_key=True)
