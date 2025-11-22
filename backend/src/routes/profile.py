from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends

from sqlalchemy.ext.asyncio.session import AsyncSession

from ..database.db import (
    get_db,
    get_user_by_id,
    get_posts_by_user_id
)


router = APIRouter()


@router.get('/me')
async def get_me(
    id: int,
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        user = await get_user_by_id(session, id)

        posts = await get_posts_by_user_id(session, id)
        posts_response = [post.to_pydantic() for post in posts]

        response = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "friend_count": user.friends_count,
            "university": user.university,
            "photo_url": user.photo_url,
            "posts": posts_response
        }

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





