from pydantic import BaseModel
from datetime import datetime


class MedicineBase(BaseModel):
    medicine_name: str
    category: str
    manufacturer: str
    batch_number: str
    expiry_date: datetime
    description: str | None = None


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    medicine_name: str | None = None
    category: str | None = None
    manufacturer: str | None = None
    batch_number: str | None = None
    expiry_date: datetime | None = None
    description: str | None = None


class MedicineResponse(MedicineBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
