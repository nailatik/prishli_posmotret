from collections import Counter
from sqlalchemy import text

class TagUserRecommendationService:
    def __init__(self, session):
        self.session = session

    async def recommend_by_tags(self, user_id, top_n=15):
        # Берём теги постов, которые лайкнул пользователь
        result = await self.session.execute(
            text("""
                SELECT pt.tag_id
                FROM likes l
                JOIN post_tags pt ON l.post_id = pt.post_id
                WHERE l.user_id = :uid
            """),
            {"uid": user_id}
        )
        liked_tags = [r[0] for r in result]

        if not liked_tags:
            return []

        # Находим других пользователей, которые лайкнули посты с этими тегами
        result = await self.session.execute(
            text("""
                SELECT l.user_id
                FROM likes l
                JOIN post_tags pt ON l.post_id = pt.post_id
                WHERE pt.tag_id = ANY(:tags) AND l.user_id != :uid
            """),
            {"tags": liked_tags, "uid": user_id}
        )
        users = [r[0] for r in result]

        scores = Counter(users)
        return scores.most_common(top_n)
