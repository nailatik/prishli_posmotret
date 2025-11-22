from collections import Counter
from .like_post_service import LikePostRecommendationService
from .tag_post_service import TagPostRecommendationService

class CombinedPostRecommendationService:
    def __init__(self, session):
        self.session = session
        self.like_service = LikePostRecommendationService(session)
        self.tag_service = TagPostRecommendationService(session)

    async def recommend_posts(self, user_id, top_n=10):
        likes_scores = await self.like_service.recommend_posts(user_id, top_n=top_n)
        tags_scores = await self.tag_service.recommend_posts(user_id, top_n=top_n)

        combined = Counter()
        for post_id, score in likes_scores:
            combined[post_id] += score * 2
        for post_id, score in tags_scores:
            combined[post_id] += score * 1

        return combined.most_common(top_n)
