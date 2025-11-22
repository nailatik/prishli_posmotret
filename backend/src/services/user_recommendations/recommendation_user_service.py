from collections import Counter

class RecommendationService:
    def __init__(self, graph_service):
        self.graph = graph_service

    async def recommend(self, user_id: int):
        friends = set(await self.graph.get_friends(user_id))
        fof = await self.graph.get_friends_of_friends(user_id)

        scores = Counter(
            u for u in fof
            if u not in friends and u != user_id
        )

        return scores.most_common(15)
