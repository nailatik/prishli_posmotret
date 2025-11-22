from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database.db import (
    get_db,
    get_user_data_by_id
)

router = APIRouter()

@router.get('/profile/{user_id}')
async def get_profile(user_id: int, session: AsyncSession = Depends(get_db)):
    try:        
        # Получение данных о пользователе
        user_data = await get_user_data_by_id(session, user_id)
        if not user_data:
            # Можно вернуть только базовые данные, если данных о профиле нет
            user_data = None

        # Формируем ответ
        profile = {
            "first_name": user_data.first_name if user_data else "",
            "last_name": user_data.last_name if user_data else "",
            "avatar": user_data.avatar_url if user_data else "",
            "bio": user_data.bio if user_data else "",
            "is_own_profile": False,  # Тут можно определить, является ли профиль текущего пользователя
            "posts": []  # Можно дополнительно получать список постов
        }

        return profile

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))