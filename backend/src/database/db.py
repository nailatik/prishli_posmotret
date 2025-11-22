from datetime import datetime
from passlib.context import CryptContext

from sqlalchemy import select, update, delete, desc
from sqlalchemy.ext.asyncio.engine import create_async_engine
from sqlalchemy.ext.asyncio.session import async_sessionmaker, AsyncSession
from sqlalchemy.exc import IntegrityError

from fastapi.exceptions import HTTPException
from fastapi import Depends, Header
from typing import Optional

from ..config import DATABASE_URL
from .models.base import Base
from .models.posts import Post
from .models.user import User
from .models.friendship import Friendship
from .models.user_data import UserData
from .models.messages import Message
from .models.comments import Comment
from .models.communities import Community
from .models.user_community import UserCommunity
from .models.community_members import CommunityMember


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

engine = create_async_engine(
    url=DATABASE_URL, 
    echo=True, 
    echo_pool=True,   
)

SessionLocal = async_sessionmaker(bind=engine, autocommit=False, autoflush=False)

async def get_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Auth

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

async def authenticate_user(session: AsyncSession, username: str, password: str):
    user = await get_by_username(session, username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=404, detail=f"{username} is not found or incorrect password")
    return user 

async def get_by_username(session: AsyncSession, username: str):
    stmt = select(User).where(User.username == username)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    return user

async def create_user(session: AsyncSession, username: str, password: str):
    hashed_password = get_password_hash(password)
    user = User(username=username, hashed_password=hashed_password)
    try:
        session.add(user)
        await session.commit()
        await session.refresh(user)
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=404, detail=f"User with username {username} already exists")

    return user

# Posts

async def get_all_posts(session: AsyncSession):
    stmt = select(
        Post.post_id,
        Post.user_id,
        Post.title,
        Post.content,
        Post.picture,
        Post.likes_count,
    ).order_by(desc(Post.post_id))

    result = await session.execute(stmt)
    rows = result.fetchall()

    posts = []
    for row in rows:
        user = await get_user_by_id(session, row.user_id)
        posts.append({
            "post_id": row.post_id,
            "author": {
                "user_id": user.user_id if user else None,
                "username": user.username if user else "Unknown"
            },
            "title": row.title,
            "description": row.content,
            "picture": row.picture,
            "likes_count": row.likes_count,
        })

    return posts

async def get_user_by_id(session: AsyncSession, id):
    stmt = select(User).where(User.user_id == id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    return user

async def create_post(session: AsyncSession, user_id: int, title: str, content: str, picture: str = None): 
    db_post = Post(user_id=user_id, title=title, content=content, picture=picture)
    session.add(db_post)
    await session.commit()
    await session.refresh(db_post)

    return db_post

async def increase_likes_by_post_id(session: AsyncSession, post_id: int):
    stmt = update(Post).where(Post.post_id == post_id).values(likes_count=Post.likes_count + 1)
    await session.execute(stmt)
    await session.commit()

async def decrease_likes_by_post_id(session: AsyncSession, post_id: int):
    stmt = update(Post).where(Post.post_id == post_id).values(likes_count=Post.likes_count - 1)
    await session.execute(stmt)
    await session.commit()

# User and userdata

async def get_all_users(session: AsyncSession):
    stmt = select(User).order_by(User.user_id)
    result = await session.execute(stmt)
    rows = result.scalars().all()
    users = [
        {
            "user_id": row.user_id, 
            "login": row.login
        } 
        for row in rows
    ]

    return users

async def get_all_users_data(session: AsyncSession):
    stmt = select(UserData).order_by(UserData.user_id)
    result = await session.execute(stmt)
    rows = result.scalars().all()
    users = [
        {
            "user_id": row.user_id,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "birthday": row.birthday,
            "gender": row.gender,
            "email": row.email,
            "phone": row.phone,
            "avatar_url": row.avatar_url,
            "bio": row.bio,
            "city": row.city,
            "country": row.country,
            "is_active": row.is_active,
        } 
        for row in rows
    ]

    return users



async def get_user_data_by_id(session: AsyncSession, id):
    stmt = select(UserData).where(UserData.user_id == id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    return user

async def update_first_name(session: AsyncSession, user_id: int, first_name: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(first_name=first_name)
    await session.execute(stmt)
    await session.commit()

async def update_last_name(session: AsyncSession, user_id: int, last_name: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(last_name=last_name)
    await session.execute(stmt)
    await session.commit()

async def update_birthday(session: AsyncSession, user_id: int, birthday: datetime):
    stmt = update(UserData).where(UserData.user_id == user_id).values(birthday=birthday)
    await session.execute(stmt)
    await session.commit()


async def update_gender(session: AsyncSession, user_id: int, gender: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(gender=gender)
    await session.execute(stmt)
    await session.commit()

async def update_bio(session: AsyncSession, user_id: int, bio: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(bio=bio)
    await session.execute(stmt)
    await session.commit()

async def update_location(session: AsyncSession, user_id: int, city: str, country: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(city=city, country=country)
    await session.execute(stmt)
    await session.commit()

async def update_email(session: AsyncSession, user_id: int, email: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(email=email)
    await session.execute(stmt)
    await session.commit()

async def update_phone(session: AsyncSession, user_id: int, phone: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(phone=phone)
    await session.execute(stmt)
    await session.commit()


async def update_avatar(session: AsyncSession, user_id: int, avatar_url: str):
    stmt = update(UserData).where(UserData.user_id == user_id).values(avatar_url=avatar_url)
    await session.execute(stmt)
    await session.commit()


# Friends

async def create_friendship(session: AsyncSession, user_id: int, friend_id: int): 
    db_friendship = Friendship(user_id=user_id, friend_id=friend_id)
    session.add(db_friendship)
    await session.commit()
    await session.refresh(db_friendship)

    return db_friendship

async def get_user_friends_by_id(session: AsyncSession, id): # worth to check if its neccessary to return result as disctionary (egor pls check)
    stmt = select(Friendship).where(Friendship.user_id == id)
    result = await session.execute(stmt)
    rows = result.scalars().all()

    friends_ids = [{"friend_id": row.friend_id} for row in rows]

    return friends_ids

# Message

async def create_message(session: AsyncSession, sender_id: int, receiver_id: int, content: str = "", picture_url: str = ""):
    db_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content,
        picture_url=picture_url
    )
    session.add(db_message)
    await session.commit()
    await session.refresh(db_message)
    return db_message

async def get_messages_between_users(session: AsyncSession, user1_id: int, user2_id: int):
    stmt = select(Message).where(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.id)
    result = await session.execute(stmt)
    rows = result.scalars().all()

    messages = [
        {
            "sender_id": row.sender_id, 
            "receiver_id": row.receiver_id, 
            "content": row.content, 
            "picture_url": row.picture_url
        } 
        for row in rows
        ]
    
    return messages

async def delete_message(session: AsyncSession, message_id: int):
    stmt = delete(Message).where(Message.id == message_id)
    await session.execute(stmt)
    await session.commit()
    return True

# Comments

async def create_comment(session: AsyncSession, post_id: int, user_id: int, content: str):
    db_comment = Comment(post_id=post_id, user_id=user_id, content=content)
    session.add(db_comment)
    await session.flush()  # Получаем ID без commit
    comment_id = db_comment.comment_id  # Сохраняем ID до commit
    await session.commit()

    return {
        "comment_id": comment_id,
        "post_id": post_id,
        "user_id": user_id,
        "content": content
    }

async def get_comments_by_post_id(session: AsyncSession, post_id: int):
    stmt = select(Comment).where(Comment.post_id == post_id).order_by(desc(Comment.comment_id))
    result = await session.execute(stmt)
    rows = result.scalars().all()
    
    comments = []
    for row in rows:
        user = await get_user_by_id(session, row.user_id)
        comments.append({
            "comment_id": row.comment_id,
            "post_id": row.post_id,
            "author": {
                "user_id": user.user_id if user else None,
                "username": user.username if user else "Unknown"
            },
            "content": row.content,
        })
    
    return comments

# Communities

async def create_community(session: AsyncSession, name: str, description: str = None, avatar: str = None):
    db_community = Community(name=name, description=description, avatar=avatar)
    session.add(db_community)
    await session.flush()
    community_id = db_community.community_id
    await session.commit()
    return {
        "community_id": community_id,
        "name": name,
        "description": description,
        "avatar": avatar
    }

async def subscribe_user_to_community(session: AsyncSession, user_id: int, community_id: int):
    # Проверяем, не подписан ли уже пользователь
    stmt = select(UserCommunity).where(
        UserCommunity.user_id == user_id,
        UserCommunity.community_id == community_id
    )
    result = await session.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        return None  # Уже подписан
    
    db_subscription = UserCommunity(user_id=user_id, community_id=community_id)
    session.add(db_subscription)
    await session.commit()
    await session.refresh(db_subscription)
    return db_subscription

async def get_user_communities(session: AsyncSession, user_id: int):
    # Получаем все подписки пользователя на сообщества
    stmt = select(UserCommunity).where(UserCommunity.user_id == user_id)
    result = await session.execute(stmt)
    subscriptions = result.scalars().all()
    
    communities = []
    for sub in subscriptions:
        # Получаем информацию о сообществе
        community_stmt = select(Community).where(Community.community_id == sub.community_id)
        community_result = await session.execute(community_stmt)
        community = community_result.scalar_one_or_none()
        
        if community:
            communities.append({
                "id": community.community_id,
                "name": community.name,
                "description": community.description or "",
                "avatar": community.avatar or "https://api.dicebear.com/7.x/fun/svg?seed=community"
            })
    
    return communities


async def add_member(session: AsyncSession, community_id: int, user_id: int):
    member = CommunityMember(community_id=community_id, user_id=user_id)
    session.add(member)
    await session.commit()
    await session.refresh(member)
    return member

async def remove_member(session: AsyncSession, community_id: int, user_id: int):
    stmt = delete(CommunityMember).where(
        (CommunityMember.community_id == community_id) &
        (CommunityMember.user_id == user_id)
    )
    await session.execute(stmt)
    await session.commit()
    return True

async def get_members_by_community(session: AsyncSession, community_id: int):
    stmt = select(CommunityMember.user_id).where(CommunityMember.community_id == community_id)
    result = await session.execute(stmt)
    members = result.scalars().all()
    return members  

async def is_member(session: AsyncSession, community_id: int, user_id: int):
    stmt = select(CommunityMember).where(
        (CommunityMember.community_id == community_id) &
        (CommunityMember.user_id == user_id)
    )
    result = await session.execute(stmt)
    member = result.scalar_one_or_none()
    return member is not None

async def get_user_communities(session: AsyncSession, user_id: int):
    
    stmt = select(CommunityMember.community_id).where(CommunityMember.user_id == user_id)
    result = await session.execute(stmt)
    community_ids = result.scalars().all() 

    if not community_ids:
        return []

    
    stmt2 = select(Community).where(Community.com_id.in_(community_ids))
    result2 = await session.execute(stmt2)
    communities = result2.scalars().all()

    return [
        {
            "com_id": com.com_id,
            "name": com.name,
            "description": com.description,
            "creator_id": com.creator_id,
            "avatar_url": com.avatar_url,
            "created_at": com.created_at,
        }
        for com in communities
    ]



async def get_current_user(
    authorization: Optional[str] = Header(None),
    session: AsyncSession = Depends(get_db)
):
    """
    Возвращает текущего пользователя по токену в заголовке Authorization
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    # В этом примере токен — username пользователя
    user = await get_by_username(session, token)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

from .models.likes import Like

async def toggle_like(session: AsyncSession, user_id: int, post_id: int):
    # проверяем, есть ли уже лайк
    stmt = select(Like).where(Like.user_id == user_id, Like.post_id == post_id)
    result = await session.execute(stmt)
    like = result.scalar_one_or_none()

    post_stmt = select(Post).where(Post.post_id == post_id)
    post_result = await session.execute(post_stmt)
    post = post_result.scalar_one_or_none()
    if not post:
        raise ValueError("Post not found")

    if like:
        # удалить лайк
        await session.delete(like)
        post.likes_count -= 1
        liked = False
    else:
        # добавить лайк
        new_like = Like(user_id=user_id, post_id=post_id)
        session.add(new_like)
        post.likes_count += 1
        liked = True

    await session.commit()
    return {"liked": liked}
# Tags todo

# Post Tags todo