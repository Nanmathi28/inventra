from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.alert import Alert, AlertType, AlertStatus
from app.models.inventory import Inventory
from app.models.medicine import Medicine


class AlertService:
    @staticmethod
    def generate_stock_alerts(db: Session):
        inventories = db.query(Inventory).all()
        
        for inventory in inventories:
            medicine = db.query(Medicine).filter(Medicine.id == inventory.medicine_id).first()
            if not medicine:
                continue
            
            existing_alert = db.query(Alert).filter(
                Alert.medicine_id == medicine.id,
                Alert.alert_type.in_([AlertType.LOW_STOCK, AlertType.CRITICAL_STOCK]),
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
        
        db.commit()
    
    @staticmethod
    def generate_expiry_alerts(db: Session):
        critical_date = datetime.now() + timedelta(days=30)
        medicines = db.query(Medicine).filter(Medicine.expiry_date <= critical_date).all()
        
        for medicine in medicines:
            existing_alert = db.query(Alert).filter(
                Alert.medicine_id == medicine.id,
                Alert.alert_type == AlertType.NEAR_EXPIRY,
                Alert.status == AlertStatus.ACTIVE
            ).first()
            
            if not existing_alert:
                new_alert = Alert(
                    medicine_id=medicine.id,
                    alert_type=AlertType.NEAR_EXPIRY,
                    message=f"Medicine {medicine.medicine_name} is near expiry. Expiry date: {medicine.expiry_date}",
                    status=AlertStatus.ACTIVE
                )
                db.add(new_alert)
        
        db.commit()
