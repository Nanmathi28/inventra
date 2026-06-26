from pydantic import BaseModel
from typing import List


class ForecastItem(BaseModel):
    medicine_id: int
    medicine_name: str
    current_stock: int
    current_demand: int          # Quantity_Sold from dataset (historical)
    predicted_demand: int
    confidence: float
    trend: str                   # "up" | "down" | "stable"
    growth_percentage: float

    class Config:
        from_attributes = True


class ForecastResponse(BaseModel):
    forecasts: List[ForecastItem]
    model_accuracy: float
    horizon_months: int