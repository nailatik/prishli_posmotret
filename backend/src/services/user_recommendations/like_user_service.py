from collections import Counter
from sqlalchemy import text

class LikeRecommendationService:
    def __init__(self, session):
        self.session = session

    async def recommend_by_likes(self, user_id, top_n=10):
        # 1. Берём все посты, которые лайкнул пользователь
        result = await self.session.execute(
            text("SELECT post_id FROM likes WHERE user_id = :uid"),
            {"uid": user_id}
        )
        liked_posts = [r[0] for r in result]

        if not liked_posts:
            return []

        # 2. Находим других пользователей, которые лайкнули те же посты
        result = await self.session.execute(
            text("""
                SELECT user_id FROM likes
                WHERE post_id = ANY(:posts) AND user_id != :uid
            """),
            {"posts": liked_posts, "uid": user_id}
        )
        users = [r[0] for r in result]

        scores = Counter(users)

        return scores.most_common(top_n)
