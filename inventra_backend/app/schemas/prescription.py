from pydantic import BaseModel
from datetime import datetime


class PrescriptionResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_path: str
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True