from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineResponse

router = APIRouter(prefix="/expiry", tags=["Expiry"])


@router.get("", response_model=List[MedicineResponse])
def get_all_expiry_medicines(db: Session = Depends(get_db)):
    medicines = db.query(Medicine).all()
    return medicines


@router.get("/critical", response_model=List[MedicineResponse])
def get_critical_expiry_medicines(db: Session = Depends(get_db)):
    critical_date = datetime.now() + timedelta(days=30)
    medicines = db.query(Medicine).filter(
        Medicine.expiry_date <= critical_date
    ).all()
    return medicines


@router.get("/warning", response_model=List[MedicineResponse])
def get_warning_expiry_medicines(db: Session = Depends(get_db)):
    warning_start = datetime.now() + timedelta(days=31)
    warning_end = datetime.now() + timedelta(days=90)
    medicines = db.query(Medicine).filter(
        Medicine.expiry_date >= warning_start,
        Medicine.expiry_date <= warning_end
    ).all()
    return medicines


@router.get("/safe", response_model=List[MedicineResponse])
def get_safe_expiry_medicines(db: Session = Depends(get_db)):
    safe_date = datetime.now() + timedelta(days=90)
    medicines = db.query(Medicine).filter(
        Medicine.expiry_date > safe_date
    ).all()
    return medicines
