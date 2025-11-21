import asyncio
from src.database.db import async_session
from src.database.models.posts import Post

async def seed():
    async with async_session() as session:
        session.add_all([
            Post(post_id=1, user_id=42, content="Привет!", picture=None),
            Post(post_id=2, user_id=7, content="С картинкой", picture="https://picsum.photos/200"),
        ])
    await session.commit()

if __name__ == "__main__":
    asyncio.run(seed())