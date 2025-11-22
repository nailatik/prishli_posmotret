from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database.db import get_db, get_current_user, get_user_data_by_id, get_posts_by_user_id
from ..services.user_recommendations.smart_recommendation_service import SmartRecommendationService

router = APIRouter()

@router.get("/api/profile/{user_id}")
async def get_profile(
    user_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Возвращает профиль: свой или чужой.
    current_user — текущий залогиненный пользователь
    """
    user = await get_user_data_by_id(session, user_id)
    posts = await get_posts_by_user_id(session, user_id)

    is_own_profile = user.user_id == current_user.user_id
    recommender = SmartRecommendationService(session)
    recommended_ids = await recommender.get_top(user_id, top_n=10)
    recommended_users = []

    for rec_id in recommended_ids:
        rec_user = await get_user_data_by_id(session, rec_id)
        if rec_user:
            recommended_users.append({
                "id": rec_user.user_id,
                "first_name": rec_user.first_name,
                "last_name": rec_user.last_name,
                "avatar": rec_user.avatar_url
            })

    return {
        "id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "avatar": user.avatar_url,
        "bio": user.bio,
        "is_own_profile": is_own_profile,
        "posts": [post.to_pydantic() for post in posts],
        "recommended_friends": recommended_users
    }
