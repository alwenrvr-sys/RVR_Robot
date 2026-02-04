from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.schemas.item import UserCreate
from app.auth.security import hash_password, verify_password


async def create_user(db: AsyncSession, user: UserCreate):
    db_user = User(
        username=user.username,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(db: AsyncSession, username: str, password: str):
    print("called authenticate_user")
    result = await db.execute(
        select(User).where(User.username == username)
    )
    user = result.scalar_one_or_none()
    print(f"Authenticating user: {username}, Found user: {user}")
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def get_all_users(db: AsyncSession):
    # Select all User records
    result = await db.execute(select(User))
    # scalars().all() returns a list of User objects
    return result.scalars().all()


