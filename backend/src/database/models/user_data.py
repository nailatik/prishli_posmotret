from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean

from .base import Base

DEFAULT_AVATAR_URL = "https://avatars.mds.yandex.net/get-yapic/28053/0UUBdbP24UkTBwP8eAKf2S04o-1/orig"

class UserData(Base):
    __tablename__ = "user_data"

    id = Column(Integer, primary_key=True) 
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False, unique=True)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birthday = Column(DateTime, nullable=False)  
    gender = Column(String, nullable=False, default="Не указан") 

    email = Column(String, unique=True, nullable=False, default="Пусто")
    phone = Column(String, unique=True, nullable=False, default="Пусто")

    avatar_url = Column(String, nullable=False, default=DEFAULT_AVATAR_URL)

    bio = Column(Text, nullable=False, default="Пусто")  
    city = Column(String, nullable=False, default="Пусто")
    country = Column(String, nullable=False, default="Пусто")
    is_active = Column(Boolean, default=True) 
    