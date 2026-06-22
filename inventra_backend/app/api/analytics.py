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


@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """
    Get comprehensive analytics data for reports and dashboards.
    """
    # Category-wise distribution
    category_query = db.query(
        Medicine.category,
        func.count(Medicine.id).label('count')
    ).group_by(Medicine.category).all()
    
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
            count=count,
            color=category_colors.get(cat, '#6b7280')
        )
        for cat, count in category_query
    ]
    
    # Stock status distribution
    stock_status_query = db.query(
        Inventory.stock_status,
        func.count(Inventory.id).label('count')
    ).group_by(Inventory.stock_status).all()
    
    status_colors = {
        'GREEN': '#22c55e',
        'YELLOW': '#f59e0b',
        'RED': '#ef4444',
    }
    
    stock_status_distribution = [
        StockStatusDistribution(
            name=status.replace('_', ' ').title(),
            value=count,
            color=status_colors.get(status, '#6b7280')
        )
        for status, count in stock_status_query
    ]
    
    # Expiry risk distribution
    now = datetime.now()
    critical_date = now + timedelta(days=30)
    warning_end = now + timedelta(days=60)
    safe_date = now + timedelta(days=90)
    
    critical_count = db.query(func.count(Medicine.id)).filter(
        Medicine.expiry_date <= critical_date
    ).scalar() or 0
    
    warning_count = db.query(func.count(Medicine.id)).filter(
        Medicine.expiry_date > critical_date,
        Medicine.expiry_date <= warning_end
    ).scalar() or 0
    
    moderate_count = db.query(func.count(Medicine.id)).filter(
        Medicine.expiry_date > warning_end,
        Medicine.expiry_date <= safe_date
    ).scalar() or 0
    
    safe_count = db.query(func.count(Medicine.id)).filter(
        Medicine.expiry_date > safe_date
    ).scalar() or 0
    
    expiry_risk_distribution = [
        ExpiryRiskDistribution(range="< 30 days", count=critical_count, color="#ef4444"),
        ExpiryRiskDistribution(range="31-60 days", count=warning_count, color="#f59e0b"),
        ExpiryRiskDistribution(range="61-90 days", count=moderate_count, color="#3b82f6"),
        ExpiryRiskDistribution(range="> 90 days", count=safe_count, color="#22c55e"),
    ]
    
    # Monthly trends (placeholder - would use actual sales data)
    monthly_trends = [
        MonthlyTrend(month="Jan", value=0),
        MonthlyTrend(month="Feb", value=0),
        MonthlyTrend(month="Mar", value=0),
        MonthlyTrend(month="Apr", value=0),
        MonthlyTrend(month="May", value=0),
        MonthlyTrend(month="Jun", value=0),
    ]
    
    # Supplier performance
    suppliers = db.query(Supplier).all()
    supplier_performance = [
        SupplierPerformance(
            supplier_id=supplier.id,
            supplier_name=supplier.supplier_name,
            reliability=85.0,  # Placeholder - would calculate from actual data
            medicines_count=0  # Placeholder - would count actual medicines per supplier
        )
        for supplier in suppliers
    ]
    
    return AnalyticsResponse(
        category_distribution=category_distribution,
        stock_status_distribution=stock_status_distribution,
        expiry_risk_distribution=expiry_risk_distribution,
        monthly_trends=monthly_trends,
        supplier_performance=supplier_performance
    )
