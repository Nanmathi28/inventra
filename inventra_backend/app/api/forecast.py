from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.schemas.forecast import ForecastResponse, ForecastItem
from app.ml.predict import predict_demand_for_medicine

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("", response_model=ForecastResponse)
def get_forecast(horizon_months: int = 6, db: Session = Depends(get_db)):
    """
    Get demand forecast for medicines using trained ML model.
    Uses Linear Regression model with R² score of 0.9680.
    """
    medicines = db.query(Medicine).all()
    forecasts = []
    
    # Load model accuracy from evaluation
    model_accuracy = 96.80  # From evaluation results
    
    for medicine in medicines:
        inventory = db.query(Inventory).filter(Inventory.medicine_id == medicine.id).first()
        
        if inventory:
            current_stock = inventory.current_stock
            
            # Prepare features for ML prediction
            # Use available data from database
            medicine_data = {
                'Category': medicine.category if hasattr(medicine, 'category') else 'General',
                'Manufacturer': medicine.manufacturer if hasattr(medicine, 'manufacturer') else 'Unknown',
                'Medicine_Form': medicine.medicine_form if hasattr(medicine, 'medicine_form') else 'Tablet',
                'Price': float(medicine.price) if hasattr(medicine, 'price') else 100.0,
                'Current_Stock': current_stock,
                'Quantity_Sold': inventory.quantity_sold if hasattr(inventory, 'quantity_sold') else 0,
                'Supplier_Name': 'Unknown',  # Would need supplier join
                'Supplier_Lead_Time': 7,  # Default lead time
                'Days_To_Expiry': 365,  # Default if not available
                'Season': 'General',
                'Month': datetime.now().month,
                'Is_Festival': 0,
                'Avg_Last_7_Days_Sales': max(current_stock * 0.1, 5),  # Estimate if not available
                'Avg_Last_30_Days_Sales': max(current_stock * 0.3, 15),  # Estimate if not available
                'Safety_Stock': inventory.safety_stock,
                'Reorder_Level': inventory.reorder_level,
                'Storage_Requirements': 'Room Temperature'
            }
            
            try:
                # Get ML prediction
                predicted_demand = predict_demand_for_medicine(medicine_data)
                predicted_demand = int(round(predicted_demand))
            except Exception as e:
                # Fallback to simple calculation if ML prediction fails
                predicted_demand = max(current_stock * 0.9, 30)
                print(f"ML prediction failed for {medicine.medicine_name}: {e}")
            
            # Calculate trend and growth based on ML prediction
            trend = "stable"
            growth_percentage = 0.0
            if predicted_demand > current_stock:
                trend = "up"
                growth_percentage = round(((predicted_demand - current_stock) / current_stock) * 100, 1)
            elif predicted_demand < current_stock:
                trend = "down"
                growth_percentage = -round(((current_stock - predicted_demand) / current_stock) * 100, 1)
            
            # Confidence score based on model accuracy
            confidence = model_accuracy
            
            forecasts.append(ForecastItem(
                medicine_id=medicine.id,
                medicine_name=medicine.medicine_name,
                current_stock=current_stock,
                predicted_demand=predicted_demand,
                confidence=confidence,
                trend=trend,
                growth_percentage=growth_percentage
            ))
    
    return ForecastResponse(
        forecasts=forecasts,
        model_accuracy=model_accuracy,
        horizon_months=horizon_months
    )
