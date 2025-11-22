from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends

from sqlalchemy.ext.asyncio.session import AsyncSession

from ..database.db import (
    get_db,
    get_user_communities,
    get_by_username,
    create_community,
    subscribe_user_to_community,
    get_community_by_id,
    is_user_subscribed,
    unsubscribe_user_from_community
)

from ..dependencies import get_current_user, get_current_user_optional


router = APIRouter()


@router.get('/communities/{community_id}')
async def get_community(
    community_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[dict | None, Depends(get_current_user_optional)] = None
):
    try:
        # Получаем сообщество по ID
        community = await get_community_by_id(session, community_id)
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")
        
        # Если пользователь авторизован, проверяем подписку
        is_subscribed = False
        if user:
            try:
                db_user = await get_by_username(session, user["username"])
                if db_user:
                    is_subscribed = await is_user_subscribed(session, db_user.user_id, community_id)
            except:
                pass  # Если ошибка при проверке подписки, просто оставляем False
        
        community["is_subscribed"] = is_subscribed
        return community
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/communities/{community_id}/subscribe')
async def subscribe_to_community(
    community_id: int,
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем user_id из username
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Проверяем, существует ли сообщество
        community = await get_community_by_id(session, community_id)
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")
        
        # Подписываем пользователя
        subscription = await subscribe_user_to_community(session, db_user.user_id, community_id)
        if subscription is None:
            return {"message": "Already subscribed", "is_subscribed": True}
        
        return {"message": "Successfully subscribed", "is_subscribed": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/communities/{community_id}/unsubscribe')
async def unsubscribe_from_community(
    community_id: int,
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем user_id из username
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Проверяем, существует ли сообщество
        community = await get_community_by_id(session, community_id)
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")
        
        # Отписываем пользователя
        success = await unsubscribe_user_from_community(session, db_user.user_id, community_id)
        if not success:
            return {"message": "Not subscribed", "is_subscribed": False}
        
        return {"message": "Successfully unsubscribed", "is_subscribed": False}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/user/me/communities')
async def get_my_communities(
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем user_id из username
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Получаем сообщества текущего пользователя
        communities = await get_user_communities(session, db_user.user_id)
        
        return communities
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/user/{user_id}/communities')
async def get_user_communities_route(
    user_id: int,
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем user_id из username для проверки
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Проверяем, что запрашиваемый user_id соответствует текущему пользователю
        if db_user.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Получаем сообщества пользователя
        communities = await get_user_communities(session, user_id)
        
        return communities
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/seed-communities')
async def seed_communities(
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем user_id из username
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = db_user.user_id
        
        # Данные для создания сообществ
        communities_data = [
            {
                "name": "Программирование и IT",
                "description": "Сообщество для обсуждения языков программирования, фреймворков и технологий",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=programming"
            },
            {
                "name": "Путешествия",
                "description": "Делимся впечатлениями о путешествиях, советами и фотографиями",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=travel"
            },
            {
                "name": "Кулинария",
                "description": "Рецепты, советы по готовке и обсуждение кулинарных традиций",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=cooking"
            },
            {
                "name": "Фотография",
                "description": "Обмен фотографиями, техниками съемки и обсуждение оборудования",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=photography"
            },
            {
                "name": "Музыка",
                "description": "Обсуждение музыки, альбомов, концертов и музыкальных инструментов",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=music"
            },
            {
                "name": "Спорт и фитнес",
                "description": "Тренировки, здоровый образ жизни и спортивные достижения",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=sport"
            },
            {
                "name": "Книги и литература",
                "description": "Обсуждение книг, авторов и литературных произведений",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=books"
            },
            {
                "name": "Кино и сериалы",
                "description": "Обсуждение фильмов, сериалов и актеров",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=movies"
            },
            {
                "name": "Искусство и дизайн",
                "description": "Творчество, дизайн, живопись и визуальное искусство",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=art"
            },
            {
                "name": "Наука и технологии",
                "description": "Новости науки, исследования и технологические инновации",
                "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=science"
            }
        ]
        
        created_communities = []
        for community_data in communities_data:
            # Создаем сообщество
            community = await create_community(
                session=session,
                name=community_data["name"],
                description=community_data["description"],
                avatar=community_data["avatar"]
            )
            
            # Подписываем пользователя на сообщество
            subscription = await subscribe_user_to_community(
                session=session,
                user_id=user_id,
                community_id=community["community_id"]
            )
            
            if subscription:
                created_communities.append({
                    "community_id": community["community_id"],
                    "name": community["name"],
                    "description": community["description"],
                    "avatar": community["avatar"]
                })
        
        return {
            "message": f"Успешно создано {len(created_communities)} сообществ и подписок",
            "communities": created_communities
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

