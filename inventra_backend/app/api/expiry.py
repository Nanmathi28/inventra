from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app.database.connection import get_db
from app.models.inventory import Inventory
from app.models.medicine import Medicine
from app.schemas.inventory import ExpiryItemResponse

router = APIRouter(prefix="/expiry", tags=["Expiry"])


def build_expiry_items(inventories: list[Inventory]) -> list[dict]:
    return [
        {
            "id": inventory.id,
            "medicine_id": inventory.medicine_id,
            "medicine_name": inventory.medicine.medicine_name,
            "category": inventory.medicine.category,
            "batch_number": inventory.batch_number,
            "expiry_date": inventory.expiry_date,
            "stock_status": inventory.stock_status,
            "updated_at": inventory.updated_at,
        }
        for inventory in inventories
        if inventory.medicine is not None
    ]


@router.get("", response_model=List[ExpiryItemResponse])
def get_all_expiry_medicines(db: Session = Depends(get_db)):
    inventories = db.query(Inventory).join(Inventory.medicine).all()
    return build_expiry_items(inventories)


@router.get("/critical", response_model=List[ExpiryItemResponse])
def get_critical_expiry_medicines(db: Session = Depends(get_db)):
    critical_date = datetime.now() + timedelta(days=30)
    inventories = db.query(Inventory).join(Inventory.medicine).filter(
        Inventory.expiry_date != None,
        Inventory.expiry_date <= critical_date
    ).all()
    return build_expiry_items(inventories)


@router.get("/warning", response_model=List[ExpiryItemResponse])
def get_warning_expiry_medicines(db: Session = Depends(get_db)):
    warning_start = datetime.now() + timedelta(days=31)
    warning_end = datetime.now() + timedelta(days=90)
    inventories = db.query(Inventory).join(Inventory.medicine).filter(
        Inventory.expiry_date != None,
        Inventory.expiry_date >= warning_start,
        Inventory.expiry_date <= warning_end
    ).all()
    return build_expiry_items(inventories)


@router.get("/safe", response_model=List[ExpiryItemResponse])
def get_safe_expiry_medicines(db: Session = Depends(get_db)):
    safe_date = datetime.now() + timedelta(days=90)
    inventories = db.query(Inventory).join(Inventory.medicine).filter(
        Inventory.expiry_date != None,
        Inventory.expiry_date > safe_date
    ).all()
    return build_expiry_items(inventories)
