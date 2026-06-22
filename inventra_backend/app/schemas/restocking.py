from pydantic import BaseModel


class RestockItem(BaseModel):
    medicine_id: int
    medicine_name: str
    current_stock: int
    predicted_demand: int
    safety_stock: int
    recommended_reorder_qty: int
    priority_level: str
    supplier_name: str


class RestockResponse(BaseModel):
    recommendations: list[RestockItem]
    total_estimated_cost: float
    critical_count: int
    high_priority_count: int
