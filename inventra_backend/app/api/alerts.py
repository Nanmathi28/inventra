from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.alert import Alert, AlertType, AlertStatus
from app.models.inventory import Inventory
from app.models.medicine import Medicine
from app.schemas.alert import AlertCreate, AlertUpdate, AlertResponse
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["Alerts"])


def generate_alerts(db: Session):
    medicines = db.query(Medicine).all()
    
    for medicine in medicines:
        inventory = db.query(Inventory).filter(Inventory.medicine_id == medicine.id).first()
        
        if inventory:
            existing_alert = db.query(Alert).filter(
                Alert.medicine_id == medicine.id,
                Alert.status == AlertStatus.ACTIVE
            ).first()
            
            if inventory.stock_status == "RED":
                if not existing_alert or existing_alert.alert_type != AlertType.CRITICAL_STOCK:
                    if existing_alert:
                        existing_alert.status = AlertStatus.RESOLVED
                    
                    new_alert = Alert(
                        medicine_id=medicine.id,
                        alert_type=AlertType.CRITICAL_STOCK,
                        message=f"Critical stock level for {medicine.medicine_name}. Current stock: {inventory.current_stock}",
                        status=AlertStatus.ACTIVE
                    )
                    db.add(new_alert)
            
            elif inventory.stock_status == "YELLOW":
                if not existing_alert or existing_alert.alert_type != AlertType.LOW_STOCK:
                    if existing_alert:
                        existing_alert.status = AlertStatus.RESOLVED
                    
                    new_alert = Alert(
                        medicine_id=medicine.id,
                        alert_type=AlertType.LOW_STOCK,
                        message=f"Low stock level for {medicine.medicine_name}. Current stock: {inventory.current_stock}",
                        status=AlertStatus.ACTIVE
                    )
                    db.add(new_alert)
        
        critical_date = datetime.now() + timedelta(days=30)
        if medicine.expiry_date <= critical_date:
            existing_expiry_alert = db.query(Alert).filter(
                Alert.medicine_id == medicine.id,
                Alert.alert_type == AlertType.NEAR_EXPIRY,
                Alert.status == AlertStatus.ACTIVE
            ).first()
            
            if not existing_expiry_alert:
                new_alert = Alert(
                    medicine_id=medicine.id,
                    alert_type=AlertType.NEAR_EXPIRY,
                    message=f"Medicine {medicine.medicine_name} is near expiry. Expiry date: {medicine.expiry_date}",
                    status=AlertStatus.ACTIVE
                )
                db.add(new_alert)
    
    db.commit()


@router.get("", response_model=List[AlertResponse])
def get_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    alerts = db.query(Alert).offset(skip).limit(limit).all()
    return alerts


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_alert = Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    update_data = alert.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_alert, field, value)
    
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.post("/generate")
def generate_system_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    generate_alerts(db)
    return {"message": "Alerts generated successfully"}
