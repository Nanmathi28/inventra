from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.schemas.restocking import RestockResponse, RestockItem
from app.models.restock_request import RestockRequest
# Re-use the EXACT same feature builder and prediction runner as Forecast.
# This guarantees that Forecast and Restocking always produce identical
# predictions for the same medicine — there is only one prediction pipeline.
from app.api.forecast import build_medicine_features, run_prediction

router = APIRouter(prefix="/restocking", tags=["Restocking"])


def _priority_level(current_stock: int, safety_stock: int, reorder_level: int) -> str:
    """
    Determine restock priority from stock levels.

    Critical → stock at or below safety stock  (immediate risk of stockout)
    High     → stock at or below reorder level  (should reorder this week)
    Medium   → recommended reorder qty > 0 but stock is above reorder level
    """
    if current_stock <= safety_stock:
        return "critical"
    elif current_stock <= reorder_level:
        return "high"
    return "medium"


def _needs_restock(
    current_stock: int,
    safety_stock: int,
    reorder_level: int,
    recommended_qty: int,
) -> bool:
    """
    A medicine needs a restock recommendation if ANY of these are true:
      • Stock is at or below safety stock   (critical — always recommend)
      • Stock is at or below reorder level  (high — always recommend)
      • The ML formula produces a positive reorder quantity
    """
    return (
        current_stock <= safety_stock
        or current_stock <= reorder_level
        or recommended_qty > 0
    )


@router.get("/recommendations", response_model=RestockResponse)
def get_restocking_recommendations(db: Session = Depends(get_db)):

    medicines = db.query(Medicine).all()

    inventory_map = {
        inv.medicine_id: inv
        for inv in db.query(Inventory).all()
    }

    all_suppliers = db.query(Supplier).all()

    default_supplier_name = (
        all_suppliers[0].supplier_name
        if len(all_suppliers) == 1
        else "Not Assigned"
    )

    # Load all ACTIVE restock requests only once
    requests = (
        db.query(RestockRequest)
        .filter(RestockRequest.status.in_(["pending", "ordered"]))
        .all()
    )

    request_map = {
        r.medicine_id: r
        for r in requests
    }

    recommendations = []
    total_cost = 0.0
    critical_count = 0
    high_priority_count = 0

    for medicine in medicines:

        inventory = inventory_map.get(int(medicine.id))
        if not inventory:
            continue

        current_stock = int(inventory.current_stock)
        safety_stock = int(inventory.safety_stock)
        reorder_level = int(inventory.reorder_level)

        existing_request = request_map.get(medicine.id)

        # ML prediction
        features = build_medicine_features(medicine, inventory)
        predicted_demand = run_prediction(features)

        # Recommended quantity
        recommended_qty = max(
            0,
            predicted_demand + safety_stock - current_stock
        )

        if not _needs_restock(
            current_stock,
            safety_stock,
            reorder_level,
            recommended_qty,
        ):
            continue

        priority = _priority_level(
            current_stock,
            safety_stock,
            reorder_level,
        )

        if priority == "critical":
            critical_count += 1
        elif priority == "high":
            high_priority_count += 1

        supplier_name = default_supplier_name

        medicine_price = float(medicine.price) if medicine.price else 0.0
        estimated_cost = recommended_qty * medicine_price
        total_cost += estimated_cost

        recommendations.append(
            RestockItem(
                medicine_id=medicine.id,
                medicine_name=medicine.medicine_name,
                current_stock=current_stock,
                predicted_demand=predicted_demand,
                safety_stock=safety_stock,
                recommended_reorder_qty=recommended_qty,
                priority_level=priority,
                supplier_name=supplier_name,
                order_status=(
                    existing_request.status
                    if existing_request
                    else "not_ordered"
                ),
            )
        )

    priority_order = {
        "critical": 0,
        "high": 1,
        "medium": 2,
    }

    recommendations.sort(
        key=lambda x: priority_order.get(
            x.priority_level,
            99,
        )
    )

    return RestockResponse(
        recommendations=recommendations,
        total_estimated_cost=round(total_cost, 2),
        critical_count=critical_count,
        high_priority_count=high_priority_count,
    )