from sqlalchemy import Column, Integer, String

from .base import Base

class user(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True)
    hashed_password = Column(String, unique=True, nullable=False)
    login = Column(String, unique=True, nullable=False)