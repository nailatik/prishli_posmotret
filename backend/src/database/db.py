from datetime import datetime, timezone

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio.engine import create_async_engine
from sqlalchemy.ext.asyncio.session import async_sessionmaker, AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import not_, null


from ..config import DATABASE_URL
from .models.base import Base
from .models.posts import Post
from .models.user import User
from .models.friendship import Friendship
from .models.user_data import UserData
from .models.messages import Message
from .models.likes import Like
from .models.tags import Tag
from .models.post_tags import PostTag


engine = create_async_engine(
    url=DATABASE_URL, 
    echo=True, 
    echo_pool=True,   
)

SessionLocal = async_sessionmaker(bind=engine, autocommit=False, autoflush=False)

async def get_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await session.close()

# Posts

async def get_all_posts(session: AsyncSession):
    stmt = select(Post.content, Post.picture).order_by(Post.post_id)
    result = await session.execute(stmt)
    posts = result.all()

    return posts

async def create_post(session: AsyncSession, user_id: int, content: str, picture: str): 
    db_post = Post(user_id=user_id, content=content, picture=picture)
    session.add(db_post)
    await session.commit()
    await session.refresh(db_post)

    return db_post

async def increase_likes_by_post_id(session: AsyncSession, post_id: int):
    stmt = update(Post).where(Post.post_id == post_id).values(likes_count=Post.likes_count + 1)
    await session.execute(stmt)
    await session.commit()

async def decrease_likes_by_post_id(session: AsyncSession, post_id: int):
    stmt = update(Post).where(Post.post_id == post_id).values(likes_count=Post.likes_count + 1)
    await session.execute(stmt)
    await session.commit()

# User and userdata

async def get_all_users(session: AsyncSession):
    stmt = select(User).order_by(Post.user_id)
    result = await session.execute(stmt)
    users = result.all()

    return users

async def get_user_by_id(session: AsyncSession, id):
    stmt = select(user).where(user.user_id == id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    return user

async def create_user(session: AsyncSession, hashed_password: str, login: str): 
    db_user = User(login=login, hashed_password=hashed_password)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    return db_user

async def update_first_name(session: AsyncSession, user_id: int, first_name: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(first_name=first_name)
    await session.execute(stmt)
    await session.commit()

async def update_last_name(session: AsyncSession, user_id: int, last_name: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(last_name=last_name)
    await session.execute(stmt)
    await session.commit()

async def update_birthday(session: AsyncSession, user_id: int, birthday: datetime):
    stmt = update(UserData).where(UserData.user_id == user_id).values(birthday=birthday)
    await session.execute(stmt)
    await session.commit()


async def update_gender(session: AsyncSession, user_id: int, gender: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(gender=gender)
    await session.execute(stmt)
    await session.commit()


async def update_bio(session: AsyncSession, user_id: int, bio: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(bio=bio)
    await session.execute(stmt)
    await session.commit()

async def update_location(session: AsyncSession, user_id: int, city: str, country: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(city=city, country=country)
    await session.execute(stmt)
    await session.commit()

async def update_email(session: AsyncSession, user_id: int, email: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(email=email)
    await session.execute(stmt)
    await session.commit()

async def update_phone(session: AsyncSession, user_id: int, phone: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(phone=phone)
    await session.execute(stmt)
    await session.commit()


async def update_avatar(session: AsyncSession, user_id: int, avatar_url: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(avatar_url=avatar_url)
    await session.execute(stmt)
    await session.commit()


# Friends

async def create_friendship(session: AsyncSession, user_id: int, friend_id: int): 
    db_friendship = Friendship(user_id=user_id, friend_id=friend_id)
    session.add(db_friendship)
    await session.commit()
    await session.refresh(db_friendship)

    return db_friendship

async def get_user_friends_by_id(session: AsyncSession, id):
    stmt = select(Friendship).where(Friendship.user_id == id)
    result = await session.execute(stmt)
    friends = result.all()

    return friends

# Message

async def create_message(session: AsyncSession, sender_id: int, receiver_id: int, content: str = "", picture_url: str = ""):
    db_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content,
        picture_url=picture_url
    )
    session.add(db_message)
    await session.commit()
    await session.refresh(db_message)
    return db_message

async def get_messages_between_users(session: AsyncSession, user1_id: int, user2_id: int):
    stmt = select(Message).where(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.id)
    result = await session.execute(stmt)
    messages = result.scalars().all()
    return messages

async def delete_message(session: AsyncSession, message_id: int):
    stmt = delete(Message).where(Message.id == message_id)
    await session.execute(stmt)
    await session.commit()
    return True

# Tags todo

# Post Tags todo