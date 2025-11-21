from sqlalchemy import Column, Integer, String, ForeignKey, Text
from .base import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    content = Column(Text, nullable=False)
    picture_url = Column(String)
