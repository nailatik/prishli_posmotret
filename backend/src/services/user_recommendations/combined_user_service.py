from collections import Counter
from .graph_user_service import GraphService
from .recommendation_user_service import RecommendationService
from .like_user_service  import LikeRecommendationService
from .tag_user_service import TagUserRecommendationService

class CombinedUserRecommendationService:
    def __init__(self, session):
        self.session = session

    async def recommend_users(self, user_id, top_n=15):
        """
        Комбинированные рекомендации пользователей:
        - друзья
        - похожие пользователи по лайкам
        - похожие пользователи по тегам
        """
        # создаём сервисы
        graph_service = GraphService(self.session)
        friend_service = RecommendationService(graph_service)
        like_service = LikeRecommendationService(self.session)
        tag_service = TagUserRecommendationService(self.session)

        # рекомендации друзей
        friends_scores = await friend_service.recommend(user_id)
        # рекомендации пользователей по лайкам
        likes_scores = await like_service.recommend_by_likes(user_id)
        # рекомендации пользователей по тегам
        tags_scores = await tag_service.recommend_by_tags(user_id)

        # объединяем с весами (например: друзья ×2, лайки ×1, теги ×1)
        combined = Counter()
        for uid, score in friends_scores:
            combined[uid] += score * 2
        for uid, score in likes_scores:
            combined[uid] += score * 1
        for uid, score in tags_scores:
            combined[uid] += score * 1

        return combined.most_common(top_n)
