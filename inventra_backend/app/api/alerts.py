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


def calculate_stock_status(current_stock, reorder_level, safety_stock):
    if current_stock <= safety_stock:
        return "RED"
    elif current_stock <= reorder_level:
        return "YELLOW"
    return "GREEN"


def generate_alerts(db: Session):
    db.query(Alert).delete()
    db.commit()

    inventories = db.query(Inventory).join(Medicine).all()

    critical_date = datetime.now() + timedelta(days=30)

    for inventory in inventories:
        medicine = inventory.medicine

        if not medicine:
            continue

        status = calculate_stock_status(
            inventory.current_stock, inventory.reorder_level, inventory.safety_stock
        )

        inventory.stock_status = status

        existing_alert = (
            db.query(Alert)
            .filter(
                Alert.medicine_id == medicine.id, Alert.status == AlertStatus.ACTIVE
            )
            .first()
        )

        if status == "RED":
            if status == "RED":
                if (
                    existing_alert is None
                    or existing_alert.alert_type != AlertType.CRITICAL_STOCK
                ):
                    if existing_alert is not None:
                        existing_alert.status = AlertStatus.RESOLVED

                new_alert = Alert(
                    medicine_id=medicine.id,
                    alert_type=AlertType.CRITICAL_STOCK,
                    message=f"Critical stock level for {medicine.medicine_name}. Current stock: {inventory.current_stock}",
                    status=AlertStatus.ACTIVE,
                )
                db.add(new_alert)

        elif status == "YELLOW":
            if (
                existing_alert is None
                or existing_alert.alert_type != AlertType.LOW_STOCK
            ):
                if existing_alert is not None:
                    existing_alert.status = AlertStatus.RESOLVED

                new_alert = Alert(
                    medicine_id=medicine.id,
                    alert_type=AlertType.LOW_STOCK,
                    message=f"Low stock level for {medicine.medicine_name}. Current stock: {inventory.current_stock}",
                    status=AlertStatus.ACTIVE,
                )
                db.add(new_alert)

        if inventory.expiry_date and inventory.expiry_date <= critical_date:
            existing_expiry_alert = (
                db.query(Alert)
                .filter(
                    Alert.medicine_id == medicine.id,
                    Alert.alert_type == AlertType.NEAR_EXPIRY,
                    Alert.status == AlertStatus.ACTIVE,
                )
                .first()
            )

            if not existing_expiry_alert:
                new_alert = Alert(
                    medicine_id=medicine.id,
                    alert_type=AlertType.NEAR_EXPIRY,
                    message=f"Medicine {medicine.medicine_name} is near expiry. Expiry date: {inventory.expiry_date}",
                    status=AlertStatus.ACTIVE,
                )
                db.add(new_alert)

    db.commit()


@router.get("", response_model=List[AlertResponse])
def get_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .filter(Alert.status == AlertStatus.ACTIVE)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return alerts


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    db_alert = Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(alert_id: int, alert: AlertUpdate, db: Session = Depends(get_db)):
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )

    update_data = alert.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_alert, field, value)

    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.post("/generate")
def generate_system_alerts(db: Session = Depends(get_db)):
    generate_alerts(db)
    return {"message": "Alerts generated successfully"}


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )

    db.delete(db_alert)
    db.commit()
