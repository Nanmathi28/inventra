from pydantic import BaseModel
from typing import List


class CategoryDistribution(BaseModel):
    category: str
    count: int
    color: str


class StockStatusDistribution(BaseModel):
    name: str
    value: int
    color: str


class ExpiryRiskDistribution(BaseModel):
    range: str
    count: int
    color: str


class MonthlyTrend(BaseModel):
    month: str
    value: int


class SupplierPerformance(BaseModel):
    supplier_id: int
    supplier_name: str
    reliability: float
    medicines_count: int


class AnalyticsResponse(BaseModel):
    category_distribution: List[CategoryDistribution]
    stock_status_distribution: List[StockStatusDistribution]
    expiry_risk_distribution: List[ExpiryRiskDistribution]
    monthly_trends: List[MonthlyTrend]
    supplier_performance: List[SupplierPerformance]
