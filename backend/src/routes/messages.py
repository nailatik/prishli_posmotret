from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.ext.asyncio.session import AsyncSession
from pydantic import BaseModel

from ..database.db import get_db, get_by_username
from ..database.scripts import (
    create_message,
    get_messages_between_users,
    delete_message
)
from ..auth.dependencies import get_current_user

router = APIRouter()


class MessageCreate(BaseModel):
    receiver_id: int
    content: str = ""
    picture_url: str = ""


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    picture_url: str | None


@router.post('/messages/send')
async def send_message(
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: dict = Depends(get_current_user),
    message_data: MessageCreate = Body(...)
):
    """Отправка нового сообщения"""
    try:
        # Получаем user_id из username
        user = await get_by_username(session, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_message = await create_message(
            session=session,
            sender_id=user.user_id,
            receiver_id=message_data.receiver_id,
            content=message_data.content,
            picture_url=message_data.picture_url
        )
        
        return {
            "id": new_message.id,
            "sender_id": new_message.sender_id,
            "receiver_id": new_message.receiver_id,
            "content": new_message.content,
            "picture_url": new_message.picture_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/messages/{user_id}')
async def get_messages_with_user(
    session: Annotated[AsyncSession, Depends(get_db)],
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Получение всех сообщений между двумя пользователями"""
    try:
        # Получаем user_id из username
        user = await get_by_username(session, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        messages = await get_messages_between_users(
            session=session,
            user1_id=user.user_id,
            user2_id=user_id
        )
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/messages/{message_id}')
async def remove_message(
    session: Annotated[AsyncSession, Depends(get_db)],
    message_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Удаление сообщения"""
    try:
        result = await delete_message(session=session, message_id=message_id)
        return {"success": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/messages/dialogs/list')
async def get_user_dialogs(
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: dict = Depends(get_current_user)
):
    """Получение списка всех диалогов пользователя"""
    try:
        from sqlalchemy import select, or_, func, and_
        from ..models.message import Message
        from ..database.db import get_user_data_by_id, get_by_username
        
        # Получаем user_id из username
        user = await get_by_username(session, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user.user_id
        
        # Получаем уникальных собеседников
        interlocutor_subquery = select(
            func.case(
                (Message.sender_id == user_id, Message.receiver_id),
                else_=Message.sender_id
            ).label('interlocutor_id')
        ).where(
            or_(Message.sender_id == user_id, Message.receiver_id == user_id)
        ).distinct().subquery()
        
        stmt = select(interlocutor_subquery.c.interlocutor_id)
        result = await session.execute(stmt)
        interlocutor_ids = [row[0] for row in result.fetchall()]
        
        # Получаем информацию о каждом собеседнике и последнем сообщении
        dialogs = []
        for interlocutor_id in interlocutor_ids:
            # Получаем последнее сообщение с этим собеседником
            last_msg_stmt = select(Message).where(
                or_(
                    and_(Message.sender_id == user_id, Message.receiver_id == interlocutor_id),
                    and_(Message.sender_id == interlocutor_id, Message.receiver_id == user_id)
                )
            ).order_by(Message.id.desc()).limit(1)
            
            last_msg_result = await session.execute(last_msg_stmt)
            last_message = last_msg_result.scalar_one_or_none()
            
            if not last_message:
                continue
            
            # Получаем данные собеседника
            interlocutor_data = await get_user_data_by_id(session, interlocutor_id)
            
            if interlocutor_data:
                full_name = f"{interlocutor_data.first_name or ''} {interlocutor_data.last_name or ''}".strip()
                
                dialogs.append({
                    "id": interlocutor_id,
                    "name": full_name or f"User {interlocutor_id}",
                    "avatar": interlocutor_data.avatar_url or "https://via.placeholder.com/50",
                    "lastMessage": last_message.content[:50] if last_message.content else "(Изображение)",
                    "unread": 0
                })
        
        return dialogs
    except Exception as e:
        print(f"Error in get_user_dialogs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/users/all')
async def get_all_users_with_data(
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: dict = Depends(get_current_user)
):
    """Получение всех пользователей с их данными для выбора диалога"""
    try:
        from ..database.db import get_all_users_data, get_by_username
        
        # Получаем user_id текущего пользователя
        user = await get_by_username(session, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        users = await get_all_users_data(session)
        
        # Исключаем текущего пользователя
        return [u for u in users if u['user_id'] != user.user_id]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
