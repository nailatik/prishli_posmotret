from typing import Annotated
from pydantic import BaseModel

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio.session import AsyncSession

from ..database.db import (
    get_db,
    get_all_posts,
    create_post as create_post_db,
    create_user,
    authenticate_user
)

from ..utils import create_access_token

from ..dependencies import get_current_user


router = APIRouter()


class SignUpRequest(BaseModel):
    username: str
    password: str


@router.post('/sign-up')
async def sign_up(
    signup_data: SignUpRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    user = await create_user(session, username=signup_data.username, password=signup_data.password)

    return {
        "id": user.user_id,
        "username": user.username,
    }


@router.post('/token')
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    user = await authenticate_user(session, username=form_data.username, password=form_data.password)
    access_token = create_access_token({"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get('/posts')
async def get_posts(
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        posts = await get_all_posts(session)

        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/create-post')
async def create_post(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        post = await create_post_db(session=session, user_id=1, title="Title test", content="Content testing")
        return {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "content": post.content,
            "picture": post.picture,
            "likes_count": post.likes_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/seed-posts')
async def seed_posts(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        posts_data = [
            {
                "user_id": 1,
                "title": "Путешествие в Японию: Токио глазами туриста",
                "content": "Невероятное путешествие по столице Японии! Увидел традиционные храмы, попробовал суши в местных ресторанах и прогулялся по неоновым улицам Сибуи. Особенно впечатлил храм Сэнсо-дзи в Асакусе. Япония - это уникальное сочетание древних традиций и современных технологий! 🇯🇵",
                "picture": "https://img.freepik.com/free-photo/beautiful-landscape-mount-fuji-japan_181624-17627.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Рецепт идеального итальянского пасты",
                "content": "Сегодня готовил настоящую пасту карбонара по рецепту итальянской бабушки! Секрет в том, чтобы использовать только яичные желтки, панчетту и пармезан. Никаких сливок! Получилось невероятно вкусно. Итальянская кухня - это искусство! 🍝",
                "picture": "https://img.freepik.com/free-photo/top-view-delicious-pasta-plate_23-2148723456.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Новый альбом любимой группы - обзор",
                "content": "Вышел долгожданный альбом! Прослушал его три раза подряд. Каждая композиция - это отдельная история. Особенно впечатлила песня про путешествия. Музыка действительно может переносить в другие миры. Рекомендую всем! 🎵",
                "picture": "https://img.freepik.com/free-photo/vinyl-record-player-vintage-music_1150-17580.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Утренняя пробежка в парке",
                "content": "Начал день с пробежки в парке. Свежий воздух, пение птиц и красивые пейзажи - что может быть лучше? Бег помогает очистить мысли и зарядиться энергией на весь день. Рекомендую всем начинать день с физической активности! 🏃‍♂️",
                "picture": "https://img.freepik.com/free-photo/young-athletic-man-running-park_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Изучаю новый язык программирования",
                "content": "Решил освоить Rust! Первые впечатления очень положительные. Система владения (ownership) поначалу кажется сложной, но это делает код более безопасным. Уже написал несколько простых программ. Программирование - это постоянное обучение! 💻",
                "picture": "https://img.freepik.com/free-photo/programming-background-with-person-working-with-codes-computer_23-2150010125.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Выходные в горах: незабываемый поход",
                "content": "Провел выходные в горах с друзьями. Поднялись на вершину, разбили лагерь и провели ночь под звездами. Утром встретили рассвет - зрелище невероятное! Природа всегда дарит вдохновение и силы. Обязательно вернусь сюда еще раз! ⛰️",
                "picture": "https://img.freepik.com/free-photo/mountain-landscape-with-snow-peaks_1150-10688.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Открыл для себя новое кафе в городе",
                "content": "Нашел уютное кафе с отличным кофе и атмосферой! Интерьер в стиле лофт, вкусные десерты и приветливый персонал. Идеальное место для работы или встреч с друзьями. Уже запланировал вернуться на выходные. Кофе здесь действительно особенный! ☕",
                "picture": "https://img.freepik.com/free-photo/coffee-cup-latte-art_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Фотография: закат над океаном",
                "content": "Поймал идеальный момент для фото! Закат над океаном получился невероятно красивым. Цвета переливались от оранжевого до фиолетового. Фотография - это способ запечатлеть моменты, которые хочется помнить вечно. Иногда природа создает настоящие произведения искусства! 📸",
                "picture": "https://img.freepik.com/free-photo/beautiful-sunset-beach_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Читаю интересную книгу о космосе",
                "content": "Начал читать книгу о космосе и черных дырах. Автор объясняет сложные концепции простым языком. Узнал много нового о теории относительности и расширении вселенной. Космос - это бесконечный источник загадок и открытий! 🌌",
                "picture": "https://img.freepik.com/free-photo/astronaut-space-exploration_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "title": "Выходной день: отдых и саморазвитие",
                "content": "Провел день продуктивно: утренняя медитация, чтение, прогулка и готовка нового блюда. Иногда важно просто замедлиться и насладиться моментом. Баланс между активностью и отдыхом - ключ к счастливой жизни. Как вы проводите выходные? 😊",
                "picture": "https://img.freepik.com/free-photo/cute-beagle-dark-brown-bow-tie_53876-89059.jpg?semt=ais_hybrid&w=800&q=80"
            }
        ]
        
        created_posts = []
        for post_data in posts_data:
            post = await create_post_db(
                session=session,
                user_id=post_data["user_id"],
                title=post_data["title"],
                content=post_data["content"],
                picture=post_data["picture"]
            )
            created_posts.append({
                "post_id": post.post_id,
                "user_id": post.user_id,
                "title": post.title,
                "content": post.content,
                "picture": post.picture,
                "likes_count": post.likes_count,
            })
        
        return {
            "message": f"Успешно создано {len(created_posts)} постов",
            "posts": created_posts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))