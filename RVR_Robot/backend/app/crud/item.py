# this is sync only
# from sqlalchemy.orm import Session
# from app.models.item import Item
# from app.schemas.item import ItemCreate

# def create_item(db: Session, item: ItemCreate):
#     db_item = Item(**item.model_dump())
#     db.add(db_item)
#     db.commit()
#     db.refresh(db_item)
#     return db_item

# def get_items(db: Session):
#     return db.query(Item).all()

# def get_item(db: Session, item_id: int):
#     return db.query(Item).filter(Item.id == item_id).first()

# def delete_item(db: Session, item_id: int):
#     item = db.query(Item).filter(Item.id == item_id).first()
#     if item:
#         db.delete(item)
#         db.commit()
#     return item

# this is async for db setup
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.item import Item
from app.schemas.item import ItemCreate


async def create_item(db: AsyncSession, item: ItemCreate):
    db_item = Item(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


async def get_items(db: AsyncSession):
    result = await db.execute(select(Item))
    return result.scalars().all()


async def get_item(db: AsyncSession, item_id: int):
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    return result.scalar_one_or_none()


async def delete_item(db: AsyncSession, item_id: int):
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()

    if item:
        await db.delete(item)
        await db.commit()

    return item
