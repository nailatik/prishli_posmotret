from sqlalchemy import Column, Integer, String

from .base import Base

class user_data(Base):
    __tablename__ = "user_data"

    user_id = Column(Integer, primary_key=True)
    full_name = Column(String)
    