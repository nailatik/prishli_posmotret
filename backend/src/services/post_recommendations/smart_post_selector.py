# backend/src/services/post_recommendations/smart_post_selector.py
class SmartPostSelector:
    """
    Формирует список постов по релевантности:
    - сначала лайки,
    - затем теги (не повторяя),
    - затем комбинированные (не повторяя)
    """
    @staticmethod
    def order_all(posts_by_likes, posts_by_tags, combined_posts, limit=None):
        result = []

        # 1) Посты по лайкам
        for pid in posts_by_likes:
            if pid not in result:
                result.append(pid)
            if limit and len(result) == limit:
                return result

        # 2) Посты по тегам
        for pid in posts_by_tags:
            if pid not in result:
                result.append(pid)
            if limit and len(result) == limit:
                return result

        # 3) Остаток из комбинированных
        for pid in combined_posts:
            if pid not in result:
                result.append(pid)
            if limit and len(result) == limit:
                return result

        return result
