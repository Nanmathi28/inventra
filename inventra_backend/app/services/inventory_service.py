from sqlalchemy.orm import Session
from app.models.inventory import Inventory, StockStatus
from app.models.medicine import Medicine


class InventoryService:
    @staticmethod
    def calculate_stock_status(current_stock: int, reorder_level: int, safety_stock: int) -> str:
        if current_stock <= safety_stock:
            return StockStatus.RED
        elif current_stock <= reorder_level:
            return StockStatus.YELLOW
        else:
            return StockStatus.GREEN
    
    @staticmethod
    def update_stock_status(inventory: Inventory, db: Session):
        inventory.stock_status = InventoryService.calculate_stock_status(
            inventory.current_stock,
            inventory.reorder_level,
            inventory.safety_stock
        )
        db.commit()
    
    @staticmethod
    def get_inventory_by_medicine(medicine_id: int, db: Session) -> Inventory | None:
        return db.query(Inventory).filter(Inventory.medicine_id == medicine_id).first()
