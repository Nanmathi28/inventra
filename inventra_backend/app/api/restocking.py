from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.schemas.restocking import RestockResponse, RestockItem

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
    """
    AI-powered restocking recommendations.

    Architecture
    ────────────
    • DB (Medicines + Inventory) is the ONLY source of truth for which
      medicines appear and receive predictions.
    • Feature preparation and ML prediction are delegated entirely to
      build_medicine_features() and run_prediction() from forecast.py,
      so both modules always return the same predicted demand for the
      same medicine.
    • Reorder formula:
          Recommended Qty = Predicted Demand + Safety Stock − Current Stock
    • A recommendation is included whenever the medicine needs a restock
      (see _needs_restock), not only when recommended_qty > 0.
    """
    medicines = db.query(Medicine).all()

    # ── Bulk queries — zero per-medicine DB round-trips ──────────────────
    inventory_map = {
        inv.medicine_id: inv
        for inv in db.query(Inventory).all()
    }

    # Build a supplier lookup keyed by medicine_id (via future supplier_medicine
    # relation).  For now the Supplier table has no FK back to medicines, so we
    # collect all suppliers and leave assignment as "Not Assigned" — this is
    # honest and avoids the previous bug of forcing every medicine to supplier #1.
    all_suppliers = db.query(Supplier).all()
    # If a supplier_medicine mapping is added later, replace this with a proper
    # join.  For now: if exactly one supplier exists, use it; otherwise "Not Assigned".
    default_supplier_name = (
        all_suppliers[0].supplier_name
        if len(all_suppliers) == 1
        else "Not Assigned"
    )

    recommendations = []
    total_cost           = 0.0
    critical_count       = 0
    high_priority_count  = 0

    for medicine in medicines:
        inventory = inventory_map.get(int(medicine.id))
        if not inventory:
            # No inventory record → cannot calculate stock levels; skip
            continue

        current_stock = int(inventory.current_stock)
        safety_stock  = int(inventory.safety_stock)
        reorder_level = int(inventory.reorder_level)

        # ── Shared prediction pipeline (same as Forecast) ─────────────────
        features         = build_medicine_features(medicine, inventory)
        predicted_demand = run_prediction(features)

        # ── Business formula ──────────────────────────────────────────────
        recommended_qty = max(0, predicted_demand + safety_stock - current_stock)
        print("=" * 60)
        print("Medicine:", medicine.medicine_name)
        print("Current Stock:", current_stock)
        print("Safety Stock:", safety_stock)
        print("Reorder Level:", reorder_level)
        print("Predicted Demand:", predicted_demand)
        print("Recommended Qty:", recommended_qty)
        print("Priority:", _priority_level(current_stock, safety_stock, reorder_level))
        print("=" * 60)
        if not _needs_restock(current_stock, safety_stock, reorder_level, recommended_qty):
            continue  # Stock is healthy; no recommendation needed

        # ── Priority ──────────────────────────────────────────────────────
        priority = _priority_level(current_stock, safety_stock, reorder_level)
        if priority == "critical":
            critical_count += 1
        elif priority == "high":
            high_priority_count += 1

        # ── Supplier ──────────────────────────────────────────────────────
        # No medicine↔supplier FK yet.  Use the only supplier when there is
        # exactly one; otherwise display "Not Assigned" honestly.
        supplier_name = default_supplier_name

        # ── Cost estimate ─────────────────────────────────────────────────
        medicine_price  = float(medicine.price) if medicine.price else 0.0
        estimated_cost  = recommended_qty * medicine_price
        total_cost     += estimated_cost

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
            )
        )

    # Sort: critical → high → medium
    _priority_order = {"critical": 0, "high": 1, "medium": 2}
    recommendations.sort(key=lambda x: _priority_order.get(x.priority_level, 99))

    return RestockResponse(
        recommendations=recommendations,
        total_estimated_cost=round(total_cost, 2),
        critical_count=critical_count,
        high_priority_count=high_priority_count,
    )