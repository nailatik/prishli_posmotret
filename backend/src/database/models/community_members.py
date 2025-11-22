from sqlalchemy import Column, Integer
from .base import Base

class CommunityMember(Base):
    __tablename__ = "community_members"

    table_id = Column(Integer, primary_key=True)
    member_id = Column(Integer, primary_key=True)
