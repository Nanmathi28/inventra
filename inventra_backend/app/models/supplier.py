from sqlalchemy import Column, Integer, String, Text
from app.database.connection import Base


class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    reliability_score = Column(Integer, nullable=False, server_default='80')