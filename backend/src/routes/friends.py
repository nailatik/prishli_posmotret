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
            .join(UserData, User.user_id == UserData.user_id, isouter=True)  # ← LEFT JOIN
            .join(Friendship, User.user_id == Friendship.friend_id)
            .where(Friendship.user_id == user_id)
            # Убрали .where(UserData.is_active == True) ← ЭТУ СТРОКУ УДАЛИТЬ
        )

        result = await session.execute(stmt)
        friends_data = []

        for user, user_data in result:
            from ..database.models.user_data import DEFAULT_AVATAR_URL
            
            friends_data.append({
                "user_id": user.user_id,
                "username": user.username,
                "first_name": user_data.first_name if user_data else "",
                "last_name": user_data.last_name if user_data else "",
                "avatar": user_data.avatar_url if user_data else DEFAULT_AVATAR_URL,
                "bio": user_data.bio if user_data else ""
            })

        return {"friends": friends_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
