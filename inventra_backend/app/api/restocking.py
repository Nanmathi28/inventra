from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.schemas.restocking import RestockResponse, RestockItem

router = APIRouter(prefix="/restocking", tags=["Restocking"])


@router.get("/recommendations", response_model=RestockResponse)
def get_restocking_recommendations(db: Session = Depends(get_db)):
    """
    Get AI-powered restocking recommendations based on predicted demand.
    Formula: Recommended_Reorder_Qty = Predicted_Demand + Safety_Stock - Current_Stock
    """
    medicines = db.query(Medicine).all()
    recommendations = []
    total_cost = 0
    critical_count = 0
    high_priority_count = 0
    
    for medicine in medicines:
        inventory = db.query(Inventory).filter(Inventory.medicine_id == medicine.id).first()
        
        if inventory:
            current_stock = inventory.current_stock
            safety_stock = inventory.safety_stock
            
            # Simplified predicted demand (in production, use ML forecast)
            predicted_demand = max(current_stock * 0.9, 30)
            
            # Calculate recommended reorder quantity
            recommended_qty = max(0, predicted_demand + safety_stock - current_stock)
            
            # Only recommend if reorder is needed
            if recommended_qty > 0:
                # Determine priority level
                if current_stock <= inventory.safety_stock:
                    priority_level = "critical"
                    critical_count += 1
                elif current_stock <= inventory.reorder_level:
                    priority_level = "high"
                    high_priority_count += 1
                else:
                    priority_level = "medium"
                
                # Get supplier (first supplier for now)
                supplier = db.query(Supplier).first()
                supplier_name = supplier.supplier_name if supplier else "Unknown"
                
                # Estimated cost (placeholder - would use actual price)
                estimated_cost = recommended_qty * 10  # Assuming avg price of 10
                total_cost += estimated_cost
                
                recommendations.append(RestockItem(
                    medicine_id=medicine.id,
                    medicine_name=medicine.medicine_name,
                    current_stock=current_stock,
                    predicted_demand=predicted_demand,
                    safety_stock=safety_stock,
                    recommended_reorder_qty=recommended_qty,
                    priority_level=priority_level,
                    supplier_name=supplier_name
                ))
    
    # Sort by priority (critical first)
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    recommendations.sort(key=lambda x: priority_order.get(x.priority_level, 99))
    
    return RestockResponse(
        recommendations=recommendations,
        total_estimated_cost=total_cost,
        critical_count=critical_count,
        high_priority_count=high_priority_count
    )
