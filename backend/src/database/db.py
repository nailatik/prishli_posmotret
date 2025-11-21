from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio.engine import create_async_engine
from sqlalchemy.ext.asyncio.session import async_sessionmaker, AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import not_, null


from ..config import DATABASE_URL
from .models.base import Base
from .models.posts import Post
from .models.user import User
from .models.friendship import Friendship

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

