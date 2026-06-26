from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.inventory import Inventory, StockStatus
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.auth.dependencies import get_current_user
from app.models.user import User
from sqlalchemy import asc

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def calculate_stock_status(current_stock: int, reorder_level: int, safety_stock: int) -> str:
    if current_stock <= safety_stock:
        return StockStatus.RED
    elif current_stock <= reorder_level:
        return StockStatus.YELLOW
    else:
        return StockStatus.GREEN


from sqlalchemy import asc

@router.get("", response_model=List[InventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    return (
        db.query(Inventory)
        .order_by(asc(Inventory.id))
        .all()
    )


@router.get("/{inventory_id}", response_model=InventoryResponse)
def get_inventory_item(inventory_id: int, db: Session = Depends(get_db)):
    inventory_item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    return inventory_item

@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db)
):
    # Check if inventory record already exists for this medicine
    existing_inventory = db.query(Inventory).filter(Inventory.medicine_id == inventory.medicine_id).first()
    
    if existing_inventory:
        # Update existing inventory record instead of creating duplicate
        stock_status = calculate_stock_status (
            inventory.current_stock,
            inventory.reorder_level,
            inventory.safety_stock
        ) 
        existing_inventory.current_stock = inventory.current_stock
        existing_inventory.reorder_level = inventory.reorder_level
        existing_inventory.safety_stock = inventory.safety_stock
        existing_inventory.batch_number = inventory.batch_number
        existing_inventory.expiry_date = inventory.expiry_date
        existing_inventory.stock_status = stock_status
        db.commit()
        db.refresh(existing_inventory)
        return existing_inventory
    # Create new inventory record if none exists
    stock_status = calculate_stock_status(
        inventory.current_stock,
        inventory.reorder_level,
        inventory.safety_stock
    )

    db_inventory = Inventory(
    medicine_id=inventory.medicine_id,
    current_stock=inventory.current_stock,
    reorder_level=inventory.reorder_level,
    safety_stock=inventory.safety_stock,
    batch_number=inventory.batch_number,
    expiry_date=inventory.expiry_date,
    stock_status=stock_status
    )
   
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory


@router.put("/{inventory_id}", response_model=InventoryResponse)
def update_inventory(
    inventory_id: int,
    inventory: InventoryUpdate,
    db: Session = Depends(get_db)

):
    db_inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not db_inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    update_data = inventory.model_dump(exclude_unset=True)

    db_inventory.batch_number = inventory.batch_number
    db_inventory.expiry_date = inventory.expiry_date
    if "current_stock" in update_data or "reorder_level" in update_data or "safety_stock" in update_data:
        current_stock = update_data.get("current_stock", db_inventory.current_stock)
        reorder_level = update_data.get("reorder_level", db_inventory.reorder_level)
        safety_stock = update_data.get("safety_stock", db_inventory.safety_stock)
        db_inventory.stock_status = calculate_stock_status(current_stock, reorder_level, safety_stock)
    
    for field, value in update_data.items():
        setattr(db_inventory, field, value)
    
    db.commit()
    db.refresh(db_inventory)
    return db_inventory


@router.delete("/{inventory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    db_inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not db_inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    db.delete(db_inventory)
    db.commit()
