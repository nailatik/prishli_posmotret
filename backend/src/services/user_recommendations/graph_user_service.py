from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class GraphService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_friends(self, user_id: int):
        result = await self.session.execute(
            text("""
                SELECT friend_id FROM friendship WHERE user_id = :uid
            """),
            {"uid": user_id}
        )
        return [r[0] for r in result]

    async def get_friends_of_friends(self, user_id: int):
        result = await self.session.execute(
            text("""
                SELECT f2.friend_id
                FROM friendship f1
                JOIN friendship f2 ON f1.friend_id = f2.user_id
                WHERE f1.user_id = :uid AND f2.friend_id != :uid
            """),
            {"uid": user_id}
        )
        return [r[0] for r in result]
