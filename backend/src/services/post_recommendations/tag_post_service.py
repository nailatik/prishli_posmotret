from collections import Counter
from sqlalchemy import text

class TagPostRecommendationService:
    def __init__(self, session):
        self.session = session

    async def recommend_posts(self, user_id, top_n=10):
        """
        Рекомендует посты на основе тегов постов, которые лайкнул пользователь
        """
        # теги постов, которые лайкнул пользователь
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

        # посты с этими тегами, исключая уже лайкнутые
        result = await self.session.execute(
            text("""
                SELECT pt.post_id FROM post_tags pt
                WHERE pt.tag_id = ANY(:tags) AND pt.post_id NOT IN (
                    SELECT post_id FROM likes WHERE user_id = :uid
                )
            """),
            {"tags": liked_tags, "uid": user_id}
        )
        counter = Counter()
        for row in result:
            counter[row[0]] += 1  # score = сколько тегов совпало

        return counter.most_common(top_n)
