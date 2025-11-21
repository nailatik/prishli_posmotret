from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends

from sqlalchemy.ext.asyncio.session import AsyncSession

from ..database.db import (
    get_db,
    get_all_posts
)


router = APIRouter()


@router.get('/posts')
async def get_posts(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        posts = await get_all_posts(session)
        posts_response = [post.to_pydantic() for post in posts]

        return posts_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


