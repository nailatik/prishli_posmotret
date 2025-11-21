from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio.session import AsyncSession

from ..database.db import (
    get_db,
    get_all_posts,
    create_post as create_post_db,
    create_user,
    authenticate_user
)

from ..utils import create_access_token

from ..dependencies import get_current_user


router = APIRouter()


@router.post('/sign-up')
async def sign_up(
    username: str,
    password: str,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    user = await create_user(session, username=username, password=password)

    return {
        "id": user.user_id,
        "username": user.username,
        "hashed_password": user.hashed_password,
    }


@router.post('/token')
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    user = await authenticate_user(session, username=form_data.username, password=form_data.password)
    access_token = create_access_token({"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get('/posts')
async def get_posts(
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        posts = await get_all_posts(session)

        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/create-post')
async def create_post(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        post = await create_post_db(session=session, user_id=1, title="Title test", content="Content testing")
        return {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "content": post.content,
            "picture": post.picture,
            "likes_count": post.likes_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))