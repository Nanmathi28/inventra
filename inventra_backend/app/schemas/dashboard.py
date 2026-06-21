from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_medicines: int
    total_inventory_items: int
    low_stock_items: int
    critical_stock_items: int
    near_expiry_items: int
    total_suppliers: int
