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


class PrescriptionItem(BaseModel):
    id: str
    doctor: str
    date: str
    medicines: str
    valid: bool


class PortalResponse(BaseModel):
    available_medicines: List[MedicineAvailability]
    orders: List  # Will be populated with Order objects from order.py schema
    prescriptions: List[PrescriptionItem]
