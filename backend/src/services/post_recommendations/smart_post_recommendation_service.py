# backend/src/services/post_recommendations/smart_post_recommendation_service.py
from .like_post_service import LikePostRecommendationService
from .tag_post_service import TagPostRecommendationService
from .combined_post_recommendations_service import CombinedPostRecommendationService
from .smart_post_selector import SmartPostSelector

class SmartPostRecommendationService:
    def __init__(self, session):
        self.session = session
        self.like_service = LikePostRecommendationService(session)
        self.tag_service = TagPostRecommendationService(session)
        self.combined_service = CombinedPostRecommendationService(session)

    async def get_all_ordered(self, user_id: int, limit: int = None):
        # Получаем рекомендации с оценками
        posts_by_likes_with_scores = await self.like_service.recommend_posts(user_id)
        posts_by_tags_with_scores = await self.tag_service.recommend_posts(user_id)
        combined_posts_with_scores = await self.combined_service.recommend_posts(user_id)

        # Оставляем только id
        posts_by_likes = [pid for pid, _ in posts_by_likes_with_scores]
        posts_by_tags = [pid for pid, _ in posts_by_tags_with_scores]
        combined_posts = [pid for pid, _ in combined_posts_with_scores]

        # Сортируем по релевантности
        return SmartPostSelector.order_all(
            posts_by_likes=posts_by_likes,
            posts_by_tags=posts_by_tags,
            combined_posts=combined_posts,
            limit=limit
        )

    async def get_ordered_batches(self, user_id: int, batch_size: int = 20, limit: int = None):
        """
        Итеративно выдаёт посты по приоритету:
        комбинированные → лайки → теги, без повторов, батчами.
        Ограничение общего количества постов через параметр `limit`.
        """
        # Получаем рекомендации с оценками
        posts_by_likes_with_scores = await self.like_service.recommend_posts(user_id)
        posts_by_tags_with_scores = await self.tag_service.recommend_posts(user_id)
        combined_posts_with_scores = await self.combined_service.recommend_posts(user_id)

        # Оставляем только id
        posts_by_likes = [pid for pid, _ in posts_by_likes_with_scores]
        posts_by_tags = [pid for pid, _ in posts_by_tags_with_scores]
        combined_posts = [pid for pid, _ in combined_posts_with_scores]

        used = set()
        total_yielded = 0

        iter_combined = iter(combined_posts)
        iter_likes = iter(posts_by_likes)
        iter_tags = iter(posts_by_tags)

        while True:
            batch = []

            for _ in range(batch_size):
                for it in (iter_combined, iter_likes, iter_tags):
                    try:
                        pid = next(it)
                        if pid not in used:
                            batch.append(pid)
                            used.add(pid)
                            total_yielded += 1

                            if limit is not None and total_yielded >= limit:
                                break
                    except StopIteration:
                        continue

                if limit is not None and total_yielded >= limit:
                    break

            if not batch:
                break

            yield batch

            if limit is not None and total_yielded >= limit:
                break
