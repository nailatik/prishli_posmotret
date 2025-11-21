from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends

from sqlalchemy.ext.asyncio.session import AsyncSession

from ..database.db import (
    get_db,
    get_all_messages
)


router = APIRouter()


@router.get('/messages')
async def get_messages(
    session: Annotated[AsyncSession, Depends(get_db)],
    id: int
):
    try:
        messages = await get_all_messages(session, id)
        messages_response = [message.to_pydantic() for message in messages]

        return messages_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))