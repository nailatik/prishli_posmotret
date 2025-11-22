from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.ext.asyncio.session import AsyncSession
from pydantic import BaseModel
from datetime import datetime

from ..database.db import get_db, get_by_username, get_user_data_by_id
from ..auth.dependencies import get_current_user
from sqlalchemy import select, or_, func, and_, desc
from ..models.message import Message

router = APIRouter()


class MessageSend(BaseModel):
    receiver_id: int
    text: str


class DialogResponse(BaseModel):
    id: int
    name: str
    avatar: str
    lastMessage: str
    unread: int


class MessageResponse(BaseModel):
    id: int
    text: str
    sender: str  # 'me' или 'them'
    time: str


@router.get('/messages/dialogs')
async def get_user_dialogs(
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: dict = Depends(get_current_user)
):
    """Получить список всех диалогов текущего пользователя"""
    try:
        # Получаем текущего пользователя
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
        
        dialogs = []
        for interlocutor_id in interlocutor_ids:
            # Получаем последнее сообщение
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
                    "avatar": interlocutor_data.avatar_url or f"https://i.pravatar.cc/150?img={interlocutor_id}",
                    "lastMessage": last_message.content[:50] if last_message.content else "",
                    "unread": 0  # TODO: добавить логику непрочитанных
                })
        
        return dialogs
    
    except Exception as e:
        print(f"Error in get_user_dialogs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/messages/{dialog_id}')
async def get_messages_with_user(
    dialog_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: dict = Depends(get_current_user)
):
    """Получить все сообщения с конкретным пользователем"""
    try:
        # Получаем текущего пользователя
        user = await get_by_username(session, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user.user_id
        
        # Получаем все сообщения между пользователями
        stmt = select(Message).where(
            or_(
                and_(Message.sender_id == user_id, Message.receiver_id == dialog_id),
                and_(Message.sender_id == dialog_id, Message.receiver_id == user_id)
            )
        ).order_by(Message.id)
        
        result = await session.execute(stmt)
        messages = result.scalars().all()
        
        # Форматируем сообщения для фронта
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "id": msg.id,
                "text": msg.content,
                "sender": "me" if msg.sender_id == user_id else "them",
                "time": "00:00"  # TODO: добавить реальное время из created_at если есть
            })
        
        return formatted_messages
    
    except Exception as e:
        print(f"Error in get_messages_with_user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/messages/send')
async def send_message(
    message_data: MessageSend,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: dict = Depends(get_current_user)
):
    """Отправить сообщение"""
    try:
        # Получаем текущего пользователя
        user = await get_by_username(session, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user.user_id
        
        # Создаем новое сообщение
        new_message = Message(
            sender_id=user_id,
            receiver_id=message_data.receiver_id,
            content=message_data.text,
            picture_url=""
        )
        
        session.add(new_message)
        await session.commit()
        await session.refresh(new_message)
        
        # Возвращаем сообщение в формате для фронта
        return {
            "id": new_message.id,
            "text": new_message.content,
            "sender": "me",
            "time": datetime.now().strftime("%H:%M")
        }
    
    except Exception as e:
        print(f"Error in send_message: {e}")
        raise HTTPException(status_code=500, detail=str(e))
