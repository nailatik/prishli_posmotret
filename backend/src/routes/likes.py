from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database.db import get_db, get_current_user, toggle_like

router = APIRouter()

@router.post("/api/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Лайк или дизлайк поста текущим пользователем (toggle)
    """
    try:
        result = await toggle_like(session, current_user.user_id, post_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "post_id": post_id,
        "user_id": current_user.user_id,
        "liked": result["liked"]
    }
