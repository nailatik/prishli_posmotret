from collections import Counter
from sqlalchemy import text

class LikePostRecommendationService:
    def __init__(self, session):
        self.session = session

    async def recommend_posts(self, user_id, top_n=10):
        """
        Рекомендует посты пользователю на основе лайков других пользователей,
        которые лайкнули те же посты, что и он.
        """
        # 1. Посты, которые лайкнул пользователь
        result = await self.session.execute(
            text("SELECT post_id FROM likes WHERE user_id = :uid"),
            {"uid": user_id}
        )
        liked_posts = [r[0] for r in result]

        if not liked_posts:
            return []

        # 2. Другие пользователи, которые лайкнули те же посты
        result = await self.session.execute(
            text("""
                SELECT post_id, user_id FROM likes
                WHERE post_id = ANY(:posts) AND user_id != :uid
            """),
            {"posts": liked_posts, "uid": user_id}
        )

        counter = Counter()
        for post_id, other_user in result:
            counter[post_id] += 1  # увеличиваем score поста по числу пересечений

        # 3. Возвращаем топ-N постов
        return counter.most_common(top_n)
