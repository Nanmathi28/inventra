from pydantic import BaseModel, EmailStr


class SupplierBase(BaseModel):
    supplier_name: str
    contact_person: str
    phone: str
    email: EmailStr
    address: str | None = None
    reliability_score: int = 80


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    supplier_name: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    reliability_score: int | None = None


class SupplierResponse(SupplierBase):
    id: int

    # NEW FIELD
    pending_orders: int = 0

    class Config:
        from_attributes = True