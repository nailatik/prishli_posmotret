from backend.src.services.user_recommendations.combined_user_service import CombinedUserRecommendationService
from backend.src.services.user_recommendations.graph_user_service import GraphService
from backend.src.services.user_recommendations.like_user_service import LikeRecommendationService
from backend.src.services.user_recommendations.recommendation_user_service import RecommendationService
from backend.src.services.user_recommendations.smart_user_selector import SmartUserSelector
from backend.src.services.user_recommendations.tag_user_service import TagUserRecommendationService


class SmartRecommendationService:
    def __init__(self, session):
        self.session = session
        self.graph_service = GraphService(session)
        self.friend_service = RecommendationService(self.graph_service)
        # self.like_service = LikeRecommendationService(session)
        self.tag_service = TagUserRecommendationService(session)
        self.combined_service = CombinedUserRecommendationService(session)

    async def get_top(self, user_id: int, top_n: int = 15):
        friends = [uid for uid, _ in await self.friend_service.recommend(user_id)]
        # likes = [uid for uid, _ in await self.like_service.recommend_by_likes(user_id)]
        tags = [uid for uid, _ in await self.tag_service.recommend_by_tags(user_id)]
        combined_with_scores = await self.combined_service.recommend_users(user_id)
        combined = [uid for uid, _ in combined_with_scores]

        return SmartUserSelector.pick_top(
            friends=friends,
            # likes=likes,
            tags=tags,
            combined=combined,
            top_n=top_n
        )
