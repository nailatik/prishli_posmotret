from typing import Annotated
from pydantic import BaseModel

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio.session import AsyncSession
from datetime import datetime
from ..database.models.user import User
from ..database.models.user_data import UserData

from ..database.db import (
    get_db,
    get_all_posts,
    create_post as create_post_db,
    create_user,
    authenticate_user,
    get_by_username,
    create_comment,
    get_comments_by_post_id
)

from ..utils import create_access_token

from ..dependencies import get_current_user, get_current_user_optional

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


class SignUpRequest(BaseModel):
    username: str
    password: str


class CreatePostRequest(BaseModel):
    title: str
    content: str
    picture: str | None = None
    community_id: int | None = None  # Если указан, пост создается от сообщества


class CreateCommentRequest(BaseModel):
    post_id: int
    content: str


@router.post('/sign-up')
async def sign_up(
    signup_data: SignUpRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    from datetime import datetime
    from ..database.models.user_data import UserData
    
    try:
        # Создаем пользователя
        user = await create_user(session, username=signup_data.username, password=signup_data.password)
        
        # СОЗДАЕМ UserData
        user_data = UserData(
            user_id=user.user_id,
            first_name=user.username,
            last_name="",
            birthday=datetime.now(),
            gender="Не указан",
            email=None,
            phone=None,
            bio="Пусто",
            city="Пусто",
            country="Пусто",
            is_active=True
        )
        session.add(user_data)
        
        # Используем flush вместо commit для сохранения без завершения транзакции
        await session.flush()
        
        # Теперь можно безопасно обращаться к user.user_id
        return {
            "id": user.user_id,
            "username": user.username,
            "first_name": user.username
        }
        
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seed-users")
async def seed_users(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        users_data = [
            {
                "username": "artem",
                "password": "12345",
                "first_name": "Артём",
                "last_name": "Дрогдев",
                "birthday": datetime(2004, 5, 28),
                "gender": "Мужской",
                "email": "artem@example.com",
                "phone": "+79999999999",
                "bio": "Основатель социальной сети 😎",
                "city": "Москва",
                "country": "Россия",
            },
            {
                "username": "maria",
                "password": "maria123",
                "first_name": "Мария",
                "last_name": "Иванова",
                "birthday": datetime(2003, 3, 15),
                "gender": "Женский",
                "email": "maria@example.com",
                "phone": "+78888888888",
                "bio": "Люблю путешествия и фотографию 📸",
                "city": "Санкт-Петербург",
                "country": "Россия",
            },
            {
                "username": "daniil",
                "password": "qwerty",
                "first_name": "Даниил",
                "last_name": "Смирнов",
                "birthday": datetime(2001, 8, 2),
                "gender": "Мужской",
                "email": "danil@example.com",
                "phone": "+77777777777",
                "bio": "Спорт — моя жизнь 🏋️‍♂️",
                "city": "Казань",
                "country": "Россия",
            }
        ]

        created_users = []

        for data in users_data:
            hashed_password = pwd_context.hash(data["password"])

            user = User(
                username=data["username"],
                hashed_password=hashed_password
            )
            session.add(user)
            await session.flush()   

            user_data = UserData(
                user_id=user.user_id,
                first_name=data["first_name"],
                last_name=data["last_name"],
                birthday=data["birthday"],
                gender=data["gender"],
                email=data["email"],
                phone=data["phone"],
                bio=data["bio"],
                city=data["city"],
                country=data["country"]
            )
            session.add(user_data)

            created_users.append({
                "user_id": user.user_id,
                "username": user.username,
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "email": data["email"],
                "city": data["city"]
            })

        await session.commit()

        return {
            "message": f"Создано {len(created_users)} пользователей",
            "users": created_users
        }

    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/token')
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    user = await authenticate_user(session, username=form_data.username, password=form_data.password)
    access_token = create_access_token({"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id
    }


@router.get('/posts')
async def get_posts(
    session: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[dict | None, Depends(get_current_user_optional)] = None
):
    try:
        posts = await get_all_posts(session)

        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/create-post')
async def create_post(
    post_data: CreatePostRequest,
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем user_id из username
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Если указан community_id, проверяем, что пользователь подписан на сообщество
        community_id = None
        if post_data.community_id:
            from ..database.db import is_user_subscribed
            is_subscribed = await is_user_subscribed(session, db_user.user_id, post_data.community_id)
            if not is_subscribed:
                raise HTTPException(status_code=403, detail="You must be subscribed to the community to create posts")
            community_id = post_data.community_id
        
        # Создаем пост
        post = await create_post_db(
            session=session,
            user_id=db_user.user_id if not community_id else None,
            community_id=community_id,
            title=post_data.title,
            content=post_data.content,
            picture=post_data.picture
        )
        return {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "community_id": post.community_id,
            "title": post.title,
            "content": post.content,
            "picture": post.picture,
            "likes_count": post.likes_count,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/seed-posts')
async def seed_posts(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем существующие сообщества
        from ..database.db import get_all_communities, create_community
        all_communities = await get_all_communities(session, None)
        community_ids = [c["id"] for c in all_communities] if all_communities else []
        
        # Если сообществ нет или их меньше 5, создаем недостающие
        if len(community_ids) < 5:
            communities_to_create = [
                {
                    "name": "Программирование и IT",
                    "description": "Сообщество для обсуждения языков программирования, фреймворков и технологий",
                    "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=programming"
                },
                {
                    "name": "Путешествия",
                    "description": "Делимся впечатлениями о путешествиях, советами и фотографиями",
                    "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=travel"
                },
                {
                    "name": "Кулинария",
                    "description": "Рецепты, советы по готовке и обсуждение кулинарных традиций",
                    "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=cooking"
                },
                {
                    "name": "Фотография",
                    "description": "Обмен фотографиями, техниками съемки и обсуждение оборудования",
                    "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=photography"
                },
                {
                    "name": "Музыка",
                    "description": "Обсуждение музыки, альбомов, концертов и музыкальных инструментов",
                    "avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=music"
                }
            ]
            
            # Создаем только недостающие сообщества
            for i in range(len(community_ids), 5):
                if i < len(communities_to_create):
                    community = await create_community(
                        session=session,
                        name=communities_to_create[i]["name"],
                        description=communities_to_create[i]["description"],
                        avatar=communities_to_create[i]["avatar"]
                    )
                    community_ids.append(community["community_id"])
        
        # Обновляем список ID сообществ после возможного создания
        all_communities = await get_all_communities(session, None)
        community_ids = [c["id"] for c in all_communities[:5]] if all_communities else []
        
        posts_data = [
            {
                "user_id": 1,
                "community_id": None,
                "title": "Путешествие в Японию: Токио глазами туриста",
                "content": "Невероятное путешествие по столице Японии! Увидел традиционные храмы, попробовал суши в местных ресторанах и прогулялся по неоновым улицам Сибуи. Особенно впечатлил храм Сэнсо-дзи в Асакусе. Япония - это уникальное сочетание древних традиций и современных технологий! 🇯🇵",
                "picture": "https://img.freepik.com/free-photo/beautiful-landscape-mount-fuji-japan_181624-17627.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 2,
                "community_id": None,
                "title": "Рецепт идеального итальянского пасты",
                "content": "Сегодня готовил настоящую пасту карбонара по рецепту итальянской бабушки! Секрет в том, чтобы использовать только яичные желтки, панчетту и пармезан. Никаких сливок! Получилось невероятно вкусно. Итальянская кухня - это искусство! 🍝",
                "picture": "https://img.freepik.com/free-photo/top-view-delicious-pasta-plate_23-2148723456.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 3,
                "community_id": None,
                "title": "Новый альбом любимой группы - обзор",
                "content": "Вышел долгожданный альбом! Прослушал его три раза подряд. Каждая композиция - это отдельная история. Особенно впечатлила песня про путешествия. Музыка действительно может переносить в другие миры. Рекомендую всем! 🎵",
                "picture": "https://img.freepik.com/free-photo/vinyl-record-player-vintage-music_1150-17580.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": None,
                "community_id": community_ids[0] if len(community_ids) > 0 else None,
                "title": "Новости сообщества: Программирование и IT",
                "content": "Делимся последними новостями из мира IT! Сегодня обсуждаем новые возможности Python 3.12 и лучшие практики разработки. Присоединяйтесь к обсуждению! 💻",
                "picture": "https://img.freepik.com/free-photo/programming-background-with-person-working-with-codes-computer_23-2150010125.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 4,
                "community_id": None,
                "title": "Утренняя пробежка в парке",
                "content": "Начал день с пробежки в парке. Свежий воздух, пение птиц и красивые пейзажи - что может быть лучше? Бег помогает очистить мысли и зарядиться энергией на весь день. Рекомендую всем начинать день с физической активности! 🏃‍♂️",
                "picture": "https://img.freepik.com/free-photo/young-athletic-man-running-park_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": None,
                "community_id": community_ids[1] if len(community_ids) > 1 else None,
                "title": "Путешествие в неизведанные места",
                "content": "Сообщество путешественников делится опытом! Сегодня рассказываем о скрытых жемчужинах Европы, которые стоит посетить. Где вы мечтаете побывать? ✈️",
                "picture": "https://img.freepik.com/free-photo/beautiful-landscape-mount-fuji-japan_181624-17627.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 3,
                "community_id": None,
                "title": "Изучаю новый язык программирования",
                "content": "Решил освоить Rust! Первые впечатления очень положительные. Система владения (ownership) поначалу кажется сложной, но это делает код более безопасным. Уже написал несколько простых программ. Программирование - это постоянное обучение! 💻",
                "picture": "https://img.freepik.com/free-photo/programming-background-with-person-working-with-codes-computer_23-2150010125.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": None,
                "community_id": community_ids[2] if len(community_ids) > 2 else None,
                "title": "Новый рецепт от сообщества кулинаров",
                "content": "Делимся секретным рецептом домашнего хлеба! Простой и вкусный рецепт, который подойдет даже новичкам. Попробуйте и поделитесь результатами! 🍞",
                "picture": "https://img.freepik.com/free-photo/top-view-delicious-pasta-plate_23-2148723456.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 2,
                "community_id": None,
                "title": "Выходные в горах: незабываемый поход",
                "content": "Провел выходные в горах с друзьями. Поднялись на вершину, разбили лагерь и провели ночь под звездами. Утром встретили рассвет - зрелище невероятное! Природа всегда дарит вдохновение и силы. Обязательно вернусь сюда еще раз! ⛰️",
                "picture": "https://img.freepik.com/free-photo/mountain-landscape-with-snow-peaks_1150-10688.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": None,
                "community_id": community_ids[3] if len(community_ids) > 3 else None,
                "title": "Фотография недели от сообщества",
                "content": "Выбираем лучшую фотографию недели! Показывайте свои работы и получайте обратную связь от профессионалов. Фотография - это искусство запечатлеть момент! 📸",
                "picture": "https://img.freepik.com/free-photo/beautiful-sunset-beach_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 3,
                "community_id": None,
                "title": "Открыл для себя новое кафе в городе",
                "content": "Нашел уютное кафе с отличным кофе и атмосферой! Интерьер в стиле лофт, вкусные десерты и приветливый персонал. Идеальное место для работы или встреч с друзьями. Уже запланировал вернуться на выходные. Кофе здесь действительно особенный! ☕",
                "picture": "https://img.freepik.com/free-photo/coffee-cup-latte-art_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": None,
                "community_id": community_ids[4] if len(community_ids) > 4 else None,
                "title": "Новый альбом в сообществе музыки",
                "content": "Обсуждаем новый релиз! Делимся впечатлениями и рекомендациями. Какая музыка вдохновляет вас? 🎵",
                "picture": "https://img.freepik.com/free-photo/vinyl-record-player-vintage-music_1150-17580.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 2,
                "community_id": None,
                "title": "Фотография: закат над океаном",
                "content": "Поймал идеальный момент для фото! Закат над океаном получился невероятно красивым. Цвета переливались от оранжевого до фиолетового. Фотография - это способ запечатлеть моменты, которые хочется помнить вечно. Иногда природа создает настоящие произведения искусства! 📸",
                "picture": "https://img.freepik.com/free-photo/beautiful-sunset-beach_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 1,
                "community_id": None,
                "title": "Читаю интересную книгу о космосе",
                "content": "Начал читать книгу о космосе и черных дырах. Автор объясняет сложные концепции простым языком. Узнал много нового о теории относительности и расширении вселенной. Космос - это бесконечный источник загадок и открытий! 🌌",
                "picture": "https://img.freepik.com/free-photo/astronaut-space-exploration_1150-10174.jpg?semt=ais_hybrid&w=800&q=80"
            },
            {
                "user_id": 2,
                "community_id": None,
                "title": "Выходной день: отдых и саморазвитие",
                "content": "Провел день продуктивно: утренняя медитация, чтение, прогулка и готовка нового блюда. Иногда важно просто замедлиться и насладиться моментом. Баланс между активностью и отдыхом - ключ к счастливой жизни. Как вы проводите выходные? 😊",
                "picture": "https://img.freepik.com/free-photo/cute-beagle-dark-brown-bow-tie_53876-89059.jpg?semt=ais_hybrid&w=800&q=80"
            }
        ]
        
        created_posts = []
        for post_data in posts_data:
            post = await create_post_db(
                session=session,
                user_id=post_data.get("user_id"),
                community_id=post_data.get("community_id"),
                title=post_data["title"],
                content=post_data["content"],
                picture=post_data["picture"]
            )
            created_posts.append({
                "post_id": post.post_id,
                "user_id": post.user_id,
                "community_id": post.community_id,
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


@router.post('/comments')
async def create_comment_route(
    comment_data: CreateCommentRequest,
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        # Получаем user_id из username
        db_user = await get_by_username(session, user["username"])
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Сохраняем данные пользователя до создания комментария
        user_id = db_user.user_id
        username = db_user.username
        
        # Создаем комментарий
        comment = await create_comment(
            session=session,
            post_id=comment_data.post_id,
            user_id=user_id,
            content=comment_data.content
        )
        
        # Получаем информацию об авторе для ответа
        return {
            "comment_id": comment["comment_id"],
            "post_id": comment["post_id"],
            "author": {
                "user_id": user_id,
                "username": username
            },
            "content": comment["content"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/posts/{post_id}/comments')
async def get_comments(
    post_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[dict | None, Depends(get_current_user_optional)] = None
):
    try:
        comments = await get_comments_by_post_id(session, post_id)
        return comments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))