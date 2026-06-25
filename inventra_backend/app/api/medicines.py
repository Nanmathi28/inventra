from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineResponse
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/medicines", tags=["Medicines"])

@router.get("", response_model=List[MedicineResponse])
def get_medicines(db: Session = Depends(get_db)):
    return db.query(Medicine).all()


@router.get("", response_model=List[MedicineResponse])
def get_medicines(db: Session = Depends(get_db)):
    return (
        db.query(Medicine)
        .order_by(Medicine.id)
        .all()
    )


@router.post("", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db)
):
    db_medicine = Medicine(**medicine.model_dump())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int,
    medicine: MedicineUpdate,
    db: Session = Depends(get_db)
):
    db_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not db_medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    update_data = medicine.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_medicine, field, value)
    
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    from app.models.inventory import Inventory
    
    db_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not db_medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    # Check for related inventory records
    inventory_count = db.query(Inventory).filter(Inventory.medicine_id == medicine_id).count()
    if inventory_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete medicine. {inventory_count} inventory record(s) exist. Delete inventory records first."
        )
    
    db.delete(db_medicine)
    db.commit()
