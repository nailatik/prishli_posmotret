from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends

from sqlalchemy.ext.asyncio.session import AsyncSession

from ..database.db import (
    get_db,
    get_all_posts,
    create_post as create_post_db,
)


router = APIRouter()


@router.get('/posts')
async def get_posts(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        posts = await get_all_posts(session)

        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/create-post')
async def create_post(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        post = await create_post_db(session=session, user_id=1, content="Hell", picture="Hell nah")
        return {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "content": post.content,
            "picture": post.picture,
            "likes_count": post.likes_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))