from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database.db import get_db, get_user_friends_by_id, get_user_data_by_id

router = APIRouter(prefix="/api/friends", tags=["friends"])


@router.get("/{user_id}")
async def get_friends(user_id: int, session: AsyncSession = Depends(get_db)):
    """
    Получить список всех друзей пользователя с полными данными
    """
    # Получаем ID всех друзей
    friends_ids = await get_user_friends_by_id(session, user_id)

    # Получаем полные данные каждого друга
    friends_list = []
    for item in friends_ids:
        friend_id = item["friend_id"]
        friend_data = await get_user_data_by_id(session, friend_id)

        if friend_data:
            friends_list.append({
                "id": friend_data.user_id,
                "name": f"{friend_data.first_name or ''} {friend_data.last_name or ''}".strip() or "Без имени",
                "avatar": friend_data.avatar_url or f"https://api.dicebear.com/7.x/fun/svg?seed={friend_id}",
                "description": friend_data.bio or "Нет описания"
            })

    return friends_list

