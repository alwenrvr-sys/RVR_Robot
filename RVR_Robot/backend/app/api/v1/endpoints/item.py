# this is sync functions
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.db.session import SessionLocal
# from app.crud.item import (
#     create_item, get_items, get_item, delete_item
# )
# from app.schemas.item import ItemCreate, ItemResponse

# router = APIRouter()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/", response_model=ItemResponse)
# def create(item: ItemCreate, db: Session = Depends(get_db)):
#     return create_item(db, item)

# @router.get("/", response_model=list[ItemResponse])
# def read_all(db: Session = Depends(get_db)):
#     return get_items(db)

# @router.get("/{item_id}", response_model=ItemResponse)
# def read(item_id: int, db: Session = Depends(get_db)):
#     item = get_item(db, item_id)
#     if not item:
#         raise HTTPException(status_code=404, detail="Item not found")
#     return item

# @router.delete("/{item_id}")
# def remove(item_id: int, db: Session = Depends(get_db)):
#     item = delete_item(db, item_id)
#     if not item:
#         raise HTTPException(status_code=404, detail="Item not found")
#     return {"message": "Item deleted"}

# this is async  functions
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.crud.item import (
    create_item, get_items, get_item, delete_item
)
from app.schemas.item import ItemCreate, ItemResponse
from app.auth.dependencies import get_current_user

router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


@router.post("/", response_model=ItemResponse)
async def create(item: ItemCreate, db: AsyncSession = Depends(get_db)):
    return await create_item(db, item)


@router.get("/", response_model=list[ItemResponse])
async def read_all(db: AsyncSession = Depends(get_db)):
    return await get_items(db)


@router.get("/{item_id}", response_model=ItemResponse)
async def read(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}")
async def remove(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await delete_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

@router.get("/", response_model=list[ItemResponse])
async def read_all(
    user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_items(db)
