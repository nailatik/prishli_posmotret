from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database.db import (
    get_db,
    get_user_data_by_id,
    get_user_by_id,
    get_by_username,
    create_friendship,
    is_friends,
    delete_friendship
)
from ..dependencies import get_current_user_optional, get_current_user
from ..services.user_recommendations.smart_user_selector import SmartUserSelector

router = APIRouter()

@router.get('/profile/{user_id}')
async def get_profile(
    user_id: int, 
    session: AsyncSession = Depends(get_db),
    user: Annotated[dict | None, Depends(get_current_user_optional)] = None
):
    try:        
        # Получение данных о пользователе
        user_data = await get_user_data_by_id(session, user_id)
        if not user_data:
            # Можно вернуть только базовые данные, если данных о профиле нет
            user_data = None

        # Определяем, является ли это профиль текущего пользователя
        is_own_profile = False
        username = None
        is_friend = False
        
        # Получаем username из таблицы User для любого профиля (для отображения)
        db_user_by_id = await get_user_by_id(session, user_id)
        profile_username = db_user_by_id.username if db_user_by_id else None
        
        if user:
            db_user = await get_by_username(session, user["username"])
            if db_user:
                if db_user.user_id == user_id:
                    is_own_profile = True
                    username = db_user.username  # Для своего профиля используем username текущего пользователя
                else:
                    # Проверяем, являются ли друзьями
                    is_friend = await is_friends(session, db_user.user_id, user_id)

        # Импортируем дефолтный аватар
        from ..database.models.user_data import DEFAULT_AVATAR_URL
        # ДОБАВЛЯЕМ РЕКОМЕНДОВАННЫХ ДРУЗЕЙ
        recommendations = []
        if user and not is_own_profile:
            # Получаем рекомендации для текущего пользователя
            current_user_id = db_user.user_id

            friends_ids = []  # ID друзей друзей
            likes_ids = []  # ID из лайков
            tags_ids = []  # ID по тегам
            combined_ids = []  # Комбинированный список

            selected_ids = SmartUserSelector.pick_top(
                friends=friends_ids,
                likes=likes_ids,
                tags=tags_ids,
                combined=combined_ids,
                top_n=15
            )

            for rec_user_id in selected_ids:
                rec_user_data = await get_user_data_by_id(session, rec_user_id)
                rec_db_user = await get_user_by_id(session, rec_user_id)

                if rec_user_data and rec_db_user:
                    recommendations.append({
                        "user_id": rec_user_id,
                        "first_name": rec_user_data.first_name,
                        "last_name": rec_user_data.last_name,
                        "avatar": rec_user_data.avatar_url,
                        "username": rec_db_user.username,
                        "is_friend": await is_friends(session, current_user_id, rec_user_id)
                    })

        # Формируем ответ
        profile = {
            "first_name": user_data.first_name if user_data else "",
            "last_name": user_data.last_name if user_data else "",
            "avatar": user_data.avatar_url if user_data and user_data.avatar_url else DEFAULT_AVATAR_URL,
            "bio": user_data.bio if user_data else "",
            "is_own_profile": is_own_profile,
            "username": username if is_own_profile else None,
            "is_friend": is_friend,
            "posts": [],
            "recommendations": recommendations
        }

        return profile

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/profile/{user_id}/add-friend')
async def add_friend(
    user_id: int,
    user: Annotated[dict, Depends(get_current_user)],
    session: AsyncSession = Depends(get_db)
):
    try:
        # Получаем текущего пользователя
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Нельзя добавить себя в друзья
        if db_user.user_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")
        
        # Проверяем, не друзья ли уже
        if await is_friends(session, db_user.user_id, user_id):
            return {"message": "Already friends", "is_friend": True}
        
        # Создаем дружбу
        await create_friendship(session, db_user.user_id, user_id)
        
        return {"message": "Friend added successfully", "is_friend": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/profile/{user_id}/remove-friend')
async def remove_friend(
    user_id: int,
    user: Annotated[dict, Depends(get_current_user)],
    session: AsyncSession = Depends(get_db)
):
    try:
        # Получаем текущего пользователя
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Удаляем дружбу
        success = await delete_friendship(session, db_user.user_id, user_id)
        if not success:
            return {"message": "Not friends", "is_friend": False}
        
        return {"message": "Friend removed successfully", "is_friend": False}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))