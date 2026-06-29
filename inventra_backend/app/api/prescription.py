from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.prescription import Prescription
from app.models.user import User
from app.schemas.prescription import PrescriptionResponse
from app.auth.dependencies import get_current_user
from app.models.alert import Alert, AlertStatus

import cloudinary.uploader
from app.config import cloudinary_config

import shutil
import os
from typing import List


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)

@router.post("/upload", response_model=PrescriptionResponse)
def upload_prescription(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    upload_result = cloudinary.uploader.upload(
        file.file,
        folder="inventra/prescriptions",
        resource_type="auto"
    )

    file_path = upload_result["secure_url"]

    prescription = Prescription(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        status="Pending",
    )

    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    
    alert = Alert(
        alert_type="prescription_upload",
        message=(
            f"Prescription Uploaded\n"
            f"Patient: {current_user.full_name}\n"
            f"Prescription ID: {prescription.id}\n"
            f"File: {prescription.file_name}"
        ),
        status=AlertStatus.ACTIVE,
    )

    db.add(alert)
    db.commit()

    return prescription

@router.get("", response_model=List[PrescriptionResponse])
def get_my_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Prescription)
        .filter(Prescription.user_id == current_user.id)
        .order_by(Prescription.uploaded_at.desc())
        .all()
    )
    
@router.post("/{prescription_id}/verify")
def verify_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
):

    prescription = (
        db.query(Prescription)
        .filter(Prescription.id == prescription_id)
        .first()
    )

    if not prescription:
        raise HTTPException(
            status_code=404,
            detail="Prescription not found"
        )

    prescription.status = "Approved"

    alert = (
        db.query(Alert)
        .filter(
            Alert.alert_type == "prescription_upload",
            Alert.message.contains(
                f"Prescription ID: {prescription.id}"
            ),
            Alert.status == AlertStatus.ACTIVE,
        )
        .first()
    )

    if alert:
        alert.status = AlertStatus.RESOLVED

    db.commit()

    return {
        "message": "Prescription verified successfully"
    }