import pandas as pd
import os
import sys
from datetime import datetime
import random
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal
from app.models.supplier import Supplier
from app.models.medicine import Medicine
from app.models.inventory import Inventory

# Paths
CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'pharmacy_dataset.csv')

def generate_supplier_contact_info(supplier_name):
    """Generate realistic contact information for a supplier."""
    # Generate realistic contact person name
    first_names = ['John', 'Jane', 'Michael', 'Sarah', 'Robert', 'Emily', 'David', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Patricia', 'Joseph']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore']
    contact_person = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    # Generate phone number
    phone = f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"
    
    # Generate email
    email = f"{contact_person.lower().replace(' ', '.')}@{supplier_name.lower().replace(' ', '')}.com"
    
    # Generate address
    streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm Blvd', 'Maple Dr', 'Cedar Ln', 'Washington Ave', 'Jefferson St', 'Madison Ave', 'Jackson Blvd']
    cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
    address = f"{random.randint(100, 9999)} {random.choice(streets)}, {random.choice(cities)}, USA"
    
    return {
        'contact_person': contact_person,
        'phone': phone,
        'email': email,
        'address': address
    }

def seed_suppliers(db: Session, df: pd.DataFrame):
    """Seed suppliers table with unique suppliers from CSV."""
    logger.info("Starting supplier seeding...")
    
    # Get unique suppliers from CSV
    unique_suppliers = df['Supplier_Name'].unique()
    logger.info(f"Found {len(unique_suppliers)} unique suppliers in CSV")
    
    suppliers_inserted = 0
    suppliers_skipped = 0
    
    for supplier_name in unique_suppliers:
        # Check if supplier already exists
        existing = db.query(Supplier).filter(Supplier.supplier_name == supplier_name).first()
        if existing:
            logger.info(f"Supplier '{supplier_name}' already exists, skipping")
            suppliers_skipped += 1
            continue
        
        # Generate contact info
        contact_info = generate_supplier_contact_info(supplier_name)
        
        # Create supplier
        supplier = Supplier(
            supplier_name=supplier_name,
            contact_person=contact_info['contact_person'],
            phone=contact_info['phone'],
            email=contact_info['email'],
            address=contact_info['address']
        )
        
        db.add(supplier)
        suppliers_inserted += 1
        logger.info(f"Inserted supplier: {supplier_name}")
    
    db.commit()
    logger.info(f"Supplier seeding complete. Inserted: {suppliers_inserted}, Skipped: {suppliers_skipped}")
    
    return suppliers_inserted

def seed_medicines(db: Session, df: pd.DataFrame):
    """Seed medicines table with unique medicines from CSV."""
    logger.info("Starting medicine seeding...")
    
    # Get unique medicines from CSV
    unique_medicines = df[['Medicine_Name', 'Category', 'Manufacturer', 'Medicine_Form', 'Price']].drop_duplicates()
    logger.info(f"Found {len(unique_medicines)} unique medicines in CSV")
    
    medicines_inserted = 0
    medicines_skipped = 0
    
    for _, row in unique_medicines.iterrows():
        medicine_name = row['Medicine_Name']
        
        # Check if medicine already exists
        existing = db.query(Medicine).filter(Medicine.medicine_name == medicine_name).first()
        if existing:
            logger.info(f"Medicine '{medicine_name}' already exists, skipping")
            medicines_skipped += 1
            continue
        
        # Create medicine (batch_number and expiry_date moved to inventory)
        medicine = Medicine(
            medicine_name=medicine_name,
            category=row['Category'],
            manufacturer=row['Manufacturer'],
            medicine_form=row['Medicine_Form'],
            price=float(row['Price']),
            description=f"{row['Category']} medicine manufactured by {row['Manufacturer']}"
        )
        
        db.add(medicine)
        medicines_inserted += 1
        logger.info(f"Inserted medicine: {medicine_name}")
    
    db.commit()
    logger.info(f"Medicine seeding complete. Inserted: {medicines_inserted}, Skipped: {medicines_skipped}")
    
    return medicines_inserted

def seed_inventory(db: Session, df: pd.DataFrame):
    """Seed inventory table with inventory records from CSV."""
    logger.info("Starting inventory seeding...")
    
    # Get unique medicine-inventory combinations
    unique_inventory = df[['Medicine_Name', 'Current_Stock', 'Safety_Stock', 'Reorder_Level', 'Expiry_Date', 'Batch_Number']].drop_duplicates()
    logger.info(f"Found {len(unique_inventory)} unique inventory records in CSV")
    
    inventory_inserted = 0
    inventory_skipped = 0
    
    for _, row in unique_inventory.iterrows():
        medicine_name = row['Medicine_Name']
        
        # Get medicine from database
        medicine = db.query(Medicine).filter(Medicine.medicine_name == medicine_name).first()
        if not medicine:
            logger.warning(f"Medicine '{medicine_name}' not found in database, skipping inventory record")
            inventory_skipped += 1
            continue
        
        # Check if inventory already exists for this medicine
        existing = db.query(Inventory).filter(Inventory.medicine_id == medicine.id).first()
        if existing:
            logger.info(f"Inventory for medicine '{medicine_name}' already exists, skipping")
            inventory_skipped += 1
            continue
        
        # Calculate stock status
        current_stock = int(row['Current_Stock'])
        safety_stock = int(row['Safety_Stock'])
        reorder_level = int(row['Reorder_Level'])
        
        if current_stock <= safety_stock:
            stock_status = "RED"
        elif current_stock <= reorder_level:
            stock_status = "YELLOW"
        else:
            stock_status = "GREEN"
        
        # Create inventory
        expiry_date = pd.to_datetime(row['Expiry_Date'])
        inventory = Inventory(
            medicine_id=medicine.id,
            current_stock=current_stock,
            reorder_level=reorder_level,
            safety_stock=safety_stock,
            stock_status=stock_status,
            batch_number=row['Batch_Number'],
            expiry_date=expiry_date
        )
        
        db.add(inventory)
        inventory_inserted += 1
        logger.info(f"Inserted inventory for medicine: {medicine_name} (Stock: {current_stock}, Status: {stock_status})")
    
    db.commit()
    logger.info(f"Inventory seeding complete. Inserted: {inventory_inserted}, Skipped: {inventory_skipped}")
    
    return inventory_inserted

def main():
    """Main seeding function."""
    logger.info("=" * 60)
    logger.info("DATABASE SEEDING STARTED")
    logger.info("=" * 60)
    
    # Check if CSV file exists
    if not os.path.exists(CSV_PATH):
        logger.error(f"CSV file not found at: {CSV_PATH}")
        return
    
    # Load CSV data
    logger.info(f"Loading data from: {CSV_PATH}")
    try:
        df = pd.read_csv(CSV_PATH)
        logger.info(f"Loaded {len(df)} rows from CSV")
    except Exception as e:
        logger.error(f"Error loading CSV: {e}")
        return
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Seed in order: suppliers -> medicines -> inventory
        suppliers_count = seed_suppliers(db, df)
        medicines_count = seed_medicines(db, df)
        inventory_count = seed_inventory(db, df)
        
        logger.info("=" * 60)
        logger.info("DATABASE SEEDING COMPLETE")
        logger.info("=" * 60)
        logger.info(f"Total suppliers inserted: {suppliers_count}")
        logger.info(f"Total medicines inserted: {medicines_count}")
        logger.info(f"Total inventory records inserted: {inventory_count}")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
