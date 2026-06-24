from pydantic import BaseModel
from datetime import datetime


class RestockRequestBase(BaseModel):
    medicine_id: int
    supplier_id: int | None = None
    requested_quantity: int
    notes: str | None = None


class RestockRequestCreate(RestockRequestBase):
    pass


class RestockRequestUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None


class RestockRequestResponse(RestockRequestBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
