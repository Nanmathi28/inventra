from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.portal import PortalResponse, MedicineAvailability
from app.schemas.order import OrderResponse
from typing import List
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/portal", tags=["Patient Portal"])


@router.get("", response_model=PortalResponse)
def get_portal_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get data for patient portal including medicine availability and order history.
    """
    medicines = db.query(Medicine).all()
    available_medicines = []
    
    for medicine in medicines:
        inventory = db.query(Inventory).filter(Inventory.medicine_id == medicine.id).first()
        
        if inventory:
            current_stock = inventory.current_stock
            
            # Determine status
            if current_stock == 0:
                status = "expired"
                available = False
            elif current_stock <= inventory.safety_stock:
                status = "critical"
                available = True
            elif current_stock <= inventory.reorder_level:
                status = "low"
                available = True
            else:
                status = "healthy"
                available = True
            
            available_medicines.append(MedicineAvailability(
                medicine_id=medicine.id,
                medicine_name=medicine.medicine_name,
                category=medicine.category,
                stock=current_stock,
                status=status,
                available=available
            ))
    
    # Get user's orders
    db_orders = (
        db.query(Order)
            .filter(Order.user_id == current_user.id)
            .order_by(Order.created_at.desc())
            .all()
    )

    orders = [
        OrderResponse.model_validate(order)
        for order in db_orders
    ]
    
    # Prescriptions would come from their respective tables
    # For now, return empty list as this feature is not fully implemented
    return PortalResponse(
        available_medicines=available_medicines,
        orders=orders,
        prescriptions=[]
    )
