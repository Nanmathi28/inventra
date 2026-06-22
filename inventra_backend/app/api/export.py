from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import StringIO
import csv
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.supplier import Supplier

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/inventory/csv")
def export_inventory_csv(db: Session = Depends(get_db)):
    """
    Export inventory data as CSV.
    """
    inventory_items = db.query(Inventory).all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Medicine ID", "Medicine Name", "Category", "Current Stock",
        "Reorder Level", "Safety Stock", "Stock Status", "Last Updated"
    ])
    
    # Write data
    for item in inventory_items:
        medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        writer.writerow([
            item.id,
            item.medicine_id,
            medicine.medicine_name if medicine else "Unknown",
            medicine.category if medicine else "Unknown",
            item.current_stock,
            item.reorder_level,
            item.safety_stock,
            item.stock_status,
            item.updated_at.strftime("%Y-%m-%d %H:%M:%S") if item.updated_at else ""
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory_export.csv"}
    )


@router.get("/medicines/csv")
def export_medicines_csv(db: Session = Depends(get_db)):
    """
    Export medicines data as CSV.
    """
    medicines = db.query(Medicine).all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Medicine Name", "Category", "Manufacturer",
        "Batch Number", "Expiry Date", "Description", "Created At"
    ])
    
    # Write data
    for medicine in medicines:
        writer.writerow([
            medicine.id,
            medicine.medicine_name,
            medicine.category,
            medicine.manufacturer,
            medicine.batch_number,
            medicine.expiry_date.strftime("%Y-%m-%d") if medicine.expiry_date else "",
            medicine.description or "",
            medicine.created_at.strftime("%Y-%m-%d %H:%M:%S") if medicine.created_at else ""
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=medicines_export.csv"}
    )


@router.get("/suppliers/csv")
def export_suppliers_csv(db: Session = Depends(get_db)):
    """
    Export suppliers data as CSV.
    """
    suppliers = db.query(Supplier).all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Supplier Name", "Contact Person", "Phone", "Email", "Address"
    ])
    
    # Write data
    for supplier in suppliers:
        writer.writerow([
            supplier.id,
            supplier.supplier_name,
            supplier.contact_person,
            supplier.phone,
            supplier.email,
            supplier.address or ""
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=suppliers_export.csv"}
    )
