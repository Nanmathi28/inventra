from sqlalchemy import Column, Integer,DateTime, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base
import enum


class StockStatus(str, enum.Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"


class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    current_stock = Column(Integer, default=0, nullable=False)
    reorder_level = Column(Integer, default=10, nullable=False)
    safety_stock = Column(Integer, default=5, nullable=False)
    stock_status = Column(String, default=StockStatus.GREEN, nullable=False)
    batch_number = Column(String, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )
    
    medicine = relationship("Medicine", backref="inventory")