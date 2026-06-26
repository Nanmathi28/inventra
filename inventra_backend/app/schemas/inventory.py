from pydantic import BaseModel
from datetime import datetime
from app.models.inventory import StockStatus


class InventoryBase(BaseModel):
    medicine_id: int
    current_stock: int = 0
    reorder_level: int = 10
    safety_stock: int = 5
    batch_number: str | None = None
    expiry_date: datetime | None = None


class ExpiryItemResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: str
    category: str
    batch_number: str | None = None
    expiry_date: datetime | None = None
    stock_status: StockStatus
    updated_at: datetime

    class Config:
        from_attributes = True


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    current_stock: int | None = None
    reorder_level: int | None = None
    safety_stock: int | None = None
    batch_number: str | None = None
    expiry_date: datetime | None = None


class InventoryResponse(BaseModel):
    id: int
    medicine_id: int
    current_stock: int
    reorder_level: int
    safety_stock: int
    stock_status: StockStatus
    batch_number: str | None = None
    expiry_date: datetime | None = None
    updated_at: datetime
    
    class Config:
        from_attributes = True