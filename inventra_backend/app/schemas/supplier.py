from pydantic import BaseModel, EmailStr


class SupplierBase(BaseModel):
    supplier_name: str
    contact_person: str
    phone: str
    email: EmailStr
    address: str | None = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    supplier_name: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None


class SupplierResponse(SupplierBase):
    id: int
    
    class Config:
        from_attributes = True
