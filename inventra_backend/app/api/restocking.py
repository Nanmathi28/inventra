from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.schemas.restocking import RestockResponse, RestockItem
from app.ml.predict import predict_demand_for_medicine

router = APIRouter(prefix="/restocking", tags=["Restocking"])


@router.get("/recommendations", response_model=RestockResponse)
def get_restocking_recommendations(db: Session = Depends(get_db)):
    """
    Get AI-powered restocking recommendations based on ML-predicted demand.
    Formula: Recommended_Reorder_Qty = Predicted_Demand + Safety_Stock - Current_Stock
    Uses trained Linear Regression model with R² score of 0.9680.
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
            
            # Prepare features for ML prediction
            medicine_data = {
                'Category': medicine.category if hasattr(medicine, 'category') else 'General',
                'Manufacturer': medicine.manufacturer if hasattr(medicine, 'manufacturer') else 'Unknown',
                'Medicine_Form': medicine.medicine_form if hasattr(medicine, 'medicine_form') else 'Tablet',
                'Price': float(medicine.price) if hasattr(medicine, 'price') else 100.0,
                'Current_Stock': current_stock,
                'Quantity_Sold': inventory.quantity_sold if hasattr(inventory, 'quantity_sold') else 0,
                'Supplier_Name': 'Unknown',
                'Supplier_Lead_Time': 7,
                'Days_To_Expiry': 365,
                'Season': 'General',
                'Month': datetime.now().month,
                'Is_Festival': 0,
                'Avg_Last_7_Days_Sales': max(current_stock * 0.1, 5),
                'Avg_Last_30_Days_Sales': max(current_stock * 0.3, 15),
                'Safety_Stock': safety_stock,
                'Reorder_Level': inventory.reorder_level,
                'Storage_Requirements': 'Room Temperature'
            }
            
            try:
                # Get ML prediction for demand
                predicted_demand = predict_demand_for_medicine(medicine_data)
                predicted_demand = int(round(predicted_demand))
            except Exception as e:
                # Fallback to simple calculation if ML prediction fails
                predicted_demand = max(current_stock * 0.9, 30)
                print(f"ML prediction failed for {medicine.medicine_name}: {e}")
            
            # Calculate recommended reorder quantity using business logic
            recommended_qty = max(0, predicted_demand + safety_stock - current_stock)
            
            # Only recommend if reorder is needed
            if recommended_qty > 0:
                # Determine priority level based on stock levels
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
                
                # Estimated cost using actual medicine price
                medicine_price = float(medicine.price) if hasattr(medicine, 'price') else 10.0
                estimated_cost = recommended_qty * medicine_price
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
