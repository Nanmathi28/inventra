from pydantic import BaseModel
from datetime import datetime
from app.models.alert import AlertType, AlertStatus


class AlertBase(BaseModel):
    medicine_id: int
    alert_type: AlertType
    message: str


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    status: AlertStatus | None = None


class AlertResponse(BaseModel):
    id: int
    medicine_id: int
    alert_type: AlertType
    message: str
    status: AlertStatus
    created_at: datetime
    
    class Config:
        from_attributes = True
