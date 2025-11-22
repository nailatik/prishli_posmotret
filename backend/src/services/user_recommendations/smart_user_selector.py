class SmartUserSelector:
    """
    Выбирает финальные рекомендации по схеме:
    50% друзья, 25% лайки, 25% теги
    С fallback на комбинированный список.
    """

    @staticmethod
    def pick_top(friends, likes, tags, combined, top_n=15):
        """
        friends, likes, tags, combined — списки ID пользователей
        top_n — сколько пользователей вернуть
        """
        result = []

        # 1) Берём примерно половину из друзей
        num_friends = min(top_n // 2, len(friends))
        for uid in friends:
            if uid not in result:
                result.append(uid)
            if len(result) == num_friends:
                break

        # 2) Берём примерно четверть из лайков
        num_likes = min(top_n // 4, len(likes))
        for uid in likes:
            if uid not in result:
                result.append(uid)
            if len(result) == num_friends + num_likes:
                break

        # 3) Берём примерно четверть из тегов
        num_tags = min(top_n - len(result), len(tags))
        for uid in tags:
            if uid not in result:
                result.append(uid)
            if len(result) == top_n:
                break

        # 4) Если всё равно меньше top_n → добить из комбинированного списка
        if len(result) < top_n:
            for uid in combined:
                if uid not in result:
                    result.append(uid)
                if len(result) == top_n:
                    break

        return result
