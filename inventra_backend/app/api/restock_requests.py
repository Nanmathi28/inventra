from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.restock_request import RestockRequest, RestockStatus
from app.models.medicine import Medicine
from app.models.supplier import Supplier
from app.schemas.restock_request import RestockRequestCreate, RestockRequestUpdate, RestockRequestResponse
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/restock-requests", tags=["Restock Requests"])


@router.get("", response_model=List[RestockRequestResponse])
def get_restock_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    requests = db.query(RestockRequest).offset(skip).limit(limit).all()
    return requests


@router.post("", response_model=RestockRequestResponse, status_code=status.HTTP_201_CREATED)
def create_restock_request(
    request_data: RestockRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate medicine exists
    medicine = db.query(Medicine).filter(Medicine.id == request_data.medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    # Validate supplier if provided
    if request_data.supplier_id:
        supplier = db.query(Supplier).filter(Supplier.id == request_data.supplier_id).first()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
    
    db_request = RestockRequest(**request_data.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


@router.put("/{request_id}", response_model=RestockRequestResponse)
def update_restock_request(
    request_id: int,
    request_update: RestockRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_request = db.query(RestockRequest).filter(RestockRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restock request not found"
        )
    
    update_data = request_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_request, field, value)
    
    db.commit()
    db.refresh(db_request)
    return db_request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restock_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_request = db.query(RestockRequest).filter(RestockRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restock request not found"
        )
    
    db.delete(db_request)
    db.commit()
