from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base
import enum


class RestockStatus(str, enum.Enum):
    PENDING = "pending"
    ORDERED = "ordered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RestockRequest(Base):
    __tablename__ = "restock_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    requested_quantity = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
    status = Column(String, default=RestockStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    medicine = relationship("Medicine")
    supplier = relationship("Supplier")
