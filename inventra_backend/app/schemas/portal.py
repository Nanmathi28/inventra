from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class MedicineAvailability(BaseModel):
    medicine_id: int
    medicine_name: str
    category: str
    stock: int
    status: str
    available: bool


class OrderItem(BaseModel):
    id: str
    medicines: str
    date: str
    total: str
    status: str


class PrescriptionItem(BaseModel):
    id: str
    doctor: str
    date: str
    medicines: str
    valid: bool


class PortalResponse(BaseModel):
    available_medicines: List[MedicineAvailability]
    orders: List[OrderItem]
    prescriptions: List[PrescriptionItem]
