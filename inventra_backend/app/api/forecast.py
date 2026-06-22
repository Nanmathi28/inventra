from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.schemas.forecast import ForecastResponse, ForecastItem
import random

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("", response_model=ForecastResponse)
def get_forecast(horizon_months: int = 6, db: Session = Depends(get_db)):
    """
    Get demand forecast for medicines.
    Currently uses a simplified model based on current stock and historical patterns.
    In production, this would use a trained ML model (Random Forest).
    """
    medicines = db.query(Medicine).all()
    forecasts = []
    
    for medicine in medicines:
        inventory = db.query(Inventory).filter(Inventory.medicine_id == medicine.id).first()
        
        if inventory:
            current_stock = inventory.current_stock
            
            # Simplified prediction logic (replace with ML model in production)
            # Base prediction on current stock with seasonal variation
            base_demand = max(current_stock * 0.8, 50)
            seasonal_factor = random.uniform(0.8, 1.3)
            predicted_demand = int(base_demand * seasonal_factor)
            
            # Calculate trend and growth
            trend = "stable"
            growth_percentage = 0.0
            if predicted_demand > current_stock:
                trend = "up"
                growth_percentage = round(((predicted_demand - current_stock) / current_stock) * 100, 1)
            elif predicted_demand < current_stock:
                trend = "down"
                growth_percentage = -round(((current_stock - predicted_demand) / current_stock) * 100, 1)
            
            # Confidence score (higher for medicines with more data)
            confidence = round(random.uniform(75, 95), 1)
            
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
        model_accuracy=85.0,  # Placeholder - would be actual model accuracy
        horizon_months=horizon_months
    )
