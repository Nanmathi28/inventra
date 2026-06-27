from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base
import enum


class AlertType(str, enum.Enum):
    LOW_STOCK = "low_stock"
    CRITICAL_STOCK = "critical_stock"
    NEAR_EXPIRY = "near_expiry"
    PATIENT_REQUEST = "patient_request"


class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    alert_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default=AlertStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    medicine = relationship("Medicine", backref="alerts")
