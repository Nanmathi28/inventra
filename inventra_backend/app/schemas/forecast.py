from pydantic import BaseModel
from typing import Optional


class ForecastRequest(BaseModel):
    medicine_id: Optional[int] = None
    horizon_months: int = 6


class ForecastItem(BaseModel):
    medicine_id: int
    medicine_name: str
    current_stock: int
    predicted_demand: int
    confidence: float
    trend: str
    growth_percentage: float


class ForecastResponse(BaseModel):
    forecasts: list[ForecastItem]
    model_accuracy: float
    horizon_months: int
