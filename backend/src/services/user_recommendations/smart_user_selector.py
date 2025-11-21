class SmartUserSelector:
    """
    Выбирает финальные рекомендации по схеме:
    50% друзья, 25% лайки, 25% теги
    С fallback на комбинированный список.
    """

    @staticmethod
    def pick_top4(friends, likes, tags, combined):
        result = []

        # 1) Берём 2 по друзьям
        for uid in friends:
            if uid not in result:
                result.append(uid)
            if len(result) == 2:
                break

        # 2) Берём 1 по лайкам
        for uid in likes:
            if uid not in result:
                result.append(uid)
                break

        # 3) Берём 1 по тегам
        for uid in tags:
            if uid not in result:
                result.append(uid)
                break

        # 4) Если всё равно меньше 4 → добить из комбинированного списка
        if len(result) < 4:
            for uid in combined:
                if uid not in result:
                    result.append(uid)
                if len(result) == 4:
                    break

        return result
