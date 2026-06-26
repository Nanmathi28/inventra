from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.schemas.dashboard import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_medicines = db.query(func.count(Medicine.id)).scalar()
    
    total_inventory_items = db.query(func.count(Inventory.id)).scalar()
    
    low_stock_items = db.query(func.count(Inventory.id)).filter(
        Inventory.current_stock > Inventory.safety_stock,
        Inventory.current_stock <= Inventory.reorder_level
    ).scalar()
    
    critical_stock_items = db.query(func.count(Inventory.id)).filter(
        Inventory.current_stock <= Inventory.safety_stock
    ).scalar()
    
    critical_date = datetime.now() + timedelta(days=30)
    near_expiry_items = db.query(func.count(Inventory.id)).filter(
        Inventory.expiry_date.isnot(None),
        Inventory.expiry_date <= critical_date
    ).scalar()
    
    total_suppliers = db.query(func.count(Supplier.id)).scalar()
    
    return DashboardSummary(
        total_medicines=total_medicines or 0,
        total_inventory_items=total_inventory_items or 0,
        low_stock_items=low_stock_items or 0,
        critical_stock_items=critical_stock_items or 0,
        near_expiry_items=near_expiry_items or 0,
        total_suppliers=total_suppliers or 0
    )
