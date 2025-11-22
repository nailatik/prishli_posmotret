from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException
from ..database.db import get_db
from ..database.models.user import User
from ..database.models.user_data import UserData
from ..database.models.friendship import Friendship

router = APIRouter()


@router.get('/friends/{user_id}')
async def get_friends(user_id: int, session: AsyncSession = Depends(get_db)):
    try:
        stmt = (
            select(User, UserData)
            .join(UserData, User.user_id == UserData.user_id)
            .join(Friendship, User.user_id == Friendship.friend_id)
            .where(Friendship.user_id == user_id)
            .where(UserData.is_active == True)
        )

        result = await session.execute(stmt)
        friends_data = []

        for user, user_data in result:
            friends_data.append({
                "user_id": user.user_id,
                "username": user.username,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "avatar": user_data.avatar_url,
                "bio": user_data.bio
            })

        return {"friends": friends_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))