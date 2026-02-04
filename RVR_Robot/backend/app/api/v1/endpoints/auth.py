from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.crud.user import authenticate_user, create_user, get_all_users
from app.schemas.item import UserCreate, Token,UserUsernameResponse
from app.auth.security import create_access_token

#  THIS LINE IS REQUIRED
router = APIRouter(prefix="/auth", tags=["Auth"])


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, user)


# @router.post("/login", response_model=Token)
# async def login(
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     db: AsyncSession = Depends(get_db)
# ):
#     user = await authenticate_user(
#         db, form_data.username, form_data.password
#     )
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     token = create_access_token({"sub": user.username})
#     return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(
    # Changed from OAuth2PasswordRequestForm to UserCreate
    # This tells FastAPI to expect JSON in the request body
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db)
):
    # Access fields using the model attributes (user_in.username)
    user = await authenticate_user(
        db, user_in.username, user_in.password
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/users", response_model=list[UserUsernameResponse])
async def read_users(db: AsyncSession = Depends(get_db)):
    """
    Fetch all registered users, returning only their usernames.
    """
    users = await get_all_users(db)
    return users