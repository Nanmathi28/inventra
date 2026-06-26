from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.schemas.analytics import (
    AnalyticsResponse, CategoryDistribution, StockStatusDistribution,
    ExpiryRiskDistribution, MonthlyTrend, SupplierPerformance
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def calculate_stock_status(current_stock, reorder_level, safety_stock):

    if current_stock <= safety_stock:
        return "RED"

    elif current_stock <= reorder_level:
        return "YELLOW"

    return "GREEN"
@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """
    Get comprehensive analytics data for reports and dashboards.
    """
    # Category-wise distribution
    category_query = (
    db.query(
        Medicine.category,
        func.sum(Inventory.current_stock).label("stock")
    )
    .join(Inventory, Inventory.medicine_id == Medicine.id)
    .group_by(Medicine.category)
    .all()
    )
    
    category_colors = {
        'Analgesics': '#3b82f6',
        'Antibiotics': '#10b981',
        'Antihistamines': '#f59e0b',
        'Diabetes': '#8b5cf6',
        'Cardiovascular': '#ef4444',
        'Gastroenterology': '#06b6d4',
        'Vitamins': '#ec4899',
        'Respiratory': '#14b8a6',
        'Steroids': '#f97316',
    }
    
    category_distribution = [
    CategoryDistribution(
        category=cat,
        count=int(stock or 0),
        color=category_colors.get(cat, "#6b7280")
    )
    for cat, stock in category_query
   ]
    
    # Stock status distribution
    green = yellow = red = 0

    inventories = db.query(Inventory).all()

    for item in inventories:
        status = calculate_stock_status(
        item.current_stock,
        item.reorder_level,
        item.safety_stock
    )

        if status == "GREEN":
            green += 1
        elif status == "YELLOW":
            yellow += 1
        else:
            red += 1

    stock_status_distribution = [
        StockStatusDistribution(
            name="Green",
            value=green,
            color="#22c55e"
        ),
        StockStatusDistribution(
            name="Yellow",
            value=yellow,
            color="#f59e0b"
        ),
        StockStatusDistribution(
            name="Red",
            value=red,
            color="#ef4444"
        )
]
    
    # Expiry risk distribution
    now = datetime.now()
    critical_date = now + timedelta(days=30)
    warning_end = now + timedelta(days=60)
    safe_date = now + timedelta(days=90)
    
    critical_count = db.query(func.count(Inventory.id)).filter(
    Inventory.expiry_date <= critical_date
    ).scalar() or 0
    
    warning_count = db.query(func.count(Inventory.id)).filter(
    Inventory.expiry_date > critical_date,
    Inventory.expiry_date <= warning_end
    ).scalar() or 0
    
    moderate_count = db.query(func.count(Inventory.id)).filter(
    Inventory.expiry_date > warning_end,
    Inventory.expiry_date <= safe_date
    ).scalar() or 0
    
    safe_count = db.query(func.count(Inventory.id)).filter(
    Inventory.expiry_date > safe_date
    ).scalar() or 0
    
    expiry_risk_distribution = [
        ExpiryRiskDistribution(range="< 30 days", count=critical_count, color="#ef4444"),
        ExpiryRiskDistribution(range="31-60 days", count=warning_count, color="#f59e0b"),
        ExpiryRiskDistribution(range="61-90 days", count=moderate_count, color="#3b82f6"),
        ExpiryRiskDistribution(range="> 90 days", count=safe_count, color="#22c55e"),
    ]
    # Potential loss by category
    loss_by_category = {}

    inventories = (
    db.query(Inventory)
    .join(Medicine)
    .all()
   )

    for inventory in inventories:

        if inventory.expiry_date is None:
            continue

        days_left = (inventory.expiry_date - now).days

    # Only medicines expiring within 90 days
        if days_left > 90:
            continue

        category = inventory.medicine.category

        loss = (
            inventory.current_stock *
            float(inventory.medicine.price)
        )

        loss_by_category[category] = (
            loss_by_category.get(category, 0)
            + loss
        )

    loss_by_category_data = [
        {
            "category": category,
            "loss": round(loss, 2)
        }
        for category, loss in loss_by_category.items()
    ]
    # Monthly trends (empty - no sales data available)
    from app.api.forecast import build_medicine_features, run_prediction
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    inventories = db.query(Inventory).join(Medicine).all()

    base_demand = 0

    for inventory in inventories:
     features = build_medicine_features(
        inventory.medicine,
        inventory
    )

     base_demand += run_prediction(features)

    monthly_trends = []

    growth = [1.00, 1.04, 1.08, 1.12, 1.16, 1.20]

    for month, factor in zip(months, growth):
     monthly_trends.append(
        MonthlyTrend(
            month=month,
            value=int(base_demand * factor)
        )
    )
    # Supplier performance (use actual reliability_score from database)
    suppliers = db.query(Supplier).all()
    supplier_performance = [
        SupplierPerformance(
            supplier_id=supplier.id,
            supplier_name=supplier.supplier_name,
            reliability=float(supplier.reliability_score or 80),
            medicines_count=0  # No direct relationship between suppliers and medicines in current schema
        )
        for supplier in suppliers
    ]
    
    return AnalyticsResponse(
    category_distribution=category_distribution,
    stock_status_distribution=stock_status_distribution,
    expiry_risk_distribution=expiry_risk_distribution,
    loss_by_category=loss_by_category_data,
    monthly_trends=monthly_trends,
    supplier_performance=supplier_performance
)
