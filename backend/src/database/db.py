from datetime import datetime, timezone
from passlib.context import CryptContext

from sqlalchemy import select
from sqlalchemy.ext.asyncio.engine import create_async_engine
from sqlalchemy.ext.asyncio.session import async_sessionmaker, AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import not_, null


from ..config import DATABASE_URL
from .models.base import Base
from .models.posts import post
from .models.user import user

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
    stmt = select(post.content, post.picture).order_by(post.post_id)
    result = await session.execute(stmt)
    post = result.all()



async def create_post(session: AsyncSession, user_id: int,content: str,picture: str): 
    db_post = post(user_id=user_id, content=content, picture=picture)
    session.add(db_post)
    await session.commit()
    await session.refresh()

    return db_post

