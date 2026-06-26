import pandas as pd
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.schemas.forecast import ForecastResponse, ForecastItem
from app.ml.predict import predict_demand_for_medicine

router = APIRouter(prefix="/forecast", tags=["Forecast"])
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

# Try both dataset paths — processed/ first, then data/ root
_DATASET_CANDIDATES = [
    os.path.join(BASE_DIR, "data", "processed", "pharmacy_dataset.csv"),
    os.path.join(BASE_DIR, "data", "pharmacy_dataset.csv"),
]

def _load_dataset() -> pd.DataFrame:
    for path in _DATASET_CANDIDATES:
        if os.path.exists(path):
            print(f"[Forecast] Loading dataset from: {path}")
            df = pd.read_csv(path)
            print(f"[Forecast] Dataset loaded: {len(df)} rows, Medicine_IDs: {df['Medicine_ID'].min()}–{df['Medicine_ID'].max()}")
            return df
    raise FileNotFoundError(
        f"pharmacy_dataset.csv not found. Tried:\n" + "\n".join(_DATASET_CANDIDATES)
    )

# Load once at startup
training_df = _load_dataset()

# Pre-index by Medicine_ID for O(1) lookup
_dataset_by_id: dict = {
    int(row["Medicine_ID"]): row
    for _, row in training_df.iterrows()
}

MODEL_ACCURACY = 96.8  # From evaluation — Linear Regression R² = 0.9680


@router.get("", response_model=ForecastResponse)
def get_forecast(horizon_months: int = 6, db: Session = Depends(get_db)):
    """
    Get demand forecast for all medicines using trained ML model.
    Uses real historical features from the dataset for predictions.
    """
    medicines = db.query(Medicine).all()
    print(f"\n[Forecast] Total medicines in DB: {len(medicines)}")

    # Load all inventories once, keyed by medicine_id
    all_inventories = db.query(Inventory).all()
    inventory_map = {inv.medicine_id: inv for inv in all_inventories}
    print(f"[Forecast] Total inventories in DB: {len(inventory_map)}")

    forecasts = []
    skipped_no_inventory = 0
    skipped_not_in_dataset = 0

    for medicine in medicines:
        medicine_id = int(medicine.id)

        # --- Skip if no inventory ---
        inventory = inventory_map.get(medicine_id)
        if not inventory:
            skipped_no_inventory += 1
            print(f"[SKIP] {medicine.medicine_name} (id={medicine_id}) — no inventory record")
            continue

        # --- Skip if not in training dataset ---
        row = _dataset_by_id.get(medicine_id)
        if row is None:
            skipped_not_in_dataset += 1
            print(f"[SKIP] {medicine.medicine_name} (id={medicine_id}) — not in dataset")
            continue

        # --- Live values from database ---
        current_stock   = int(inventory.current_stock)
        safety_stock    = int(inventory.safety_stock)
        reorder_level   = int(inventory.reorder_level)

        # --- Real historical values from dataset ---
        quantity_sold       = float(row["Quantity_Sold"])
        avg_7_days_sales    = float(row["Avg_Last_7_Days_Sales"])
        avg_30_days_sales   = float(row["Avg_Last_30_Days_Sales"])

        medicine_data = {
            "Category":             row["Category"],
            "Manufacturer":         row["Manufacturer"],
            "Medicine_Form":        row["Medicine_Form"],
            "Price":                float(row["Price"]),

            # Live from DB
            "Current_Stock":        current_stock,
            "Safety_Stock":         safety_stock,
            "Reorder_Level":        reorder_level,

            # Historical from dataset
            "Quantity_Sold":        quantity_sold,
            "Supplier_Name":        row["Supplier_Name"],
            "Supplier_Lead_Time":   row["Supplier_Lead_Time"],
            "Days_To_Expiry":       row["Days_To_Expiry"],
            "Season":               row["Season"],
            "Month":                row["Month"],
            "Is_Festival":          row["Is_Festival"],
            "Avg_Last_7_Days_Sales": avg_7_days_sales,
            "Avg_Last_30_Days_Sales": avg_30_days_sales,
            "Storage_Requirements": row["Storage_Requirements"],
        }

        # --- ML Prediction ---
        try:
            predicted_demand = int(round(predict_demand_for_medicine(medicine_data)))
        except Exception as e:
            predicted_demand = int(round(quantity_sold))  # fallback to historical
            print(f"[WARN] ML prediction failed for {medicine.medicine_name}: {e}")

        # Debug log for first 5 medicines
        if len(forecasts) < 5:
            print("=" * 50)
            print(f"Medicine      : {medicine.medicine_name}")
            print(f"Current Stock : {current_stock}")
            print(f"Quantity Sold : {quantity_sold}")
            print(f"7 Day Avg     : {avg_7_days_sales}")
            print(f"30 Day Avg    : {avg_30_days_sales}")
            print(f"Prediction    : {predicted_demand}")

        # --- Trend: compare predicted vs historical quantity sold (NOT current stock) ---
        STABLE_THRESHOLD = 0.05  # within 5% = stable

        if quantity_sold == 0:
            trend = "stable"
            growth_percentage = 0.0
        else:
            diff_ratio = (predicted_demand - quantity_sold) / quantity_sold
            if diff_ratio > STABLE_THRESHOLD:
                trend = "up"
                growth_percentage = round(diff_ratio * 100, 1)
            elif diff_ratio < -STABLE_THRESHOLD:
                trend = "down"
                growth_percentage = round(diff_ratio * 100, 1)  # negative value
            else:
                trend = "stable"
                growth_percentage = round(diff_ratio * 100, 1)

        forecasts.append(
            ForecastItem(
                medicine_id=medicine_id,
                medicine_name=medicine.medicine_name,
                current_stock=current_stock,
                current_demand=int(quantity_sold),   # ← real historical demand
                predicted_demand=predicted_demand,
                confidence=MODEL_ACCURACY,
                trend=trend,
                growth_percentage=growth_percentage,
            )
        )

    forecasts.sort(key=lambda x: x.medicine_id)

    print(f"\n[Forecast] Included: {len(forecasts)} medicines")
    print(f"[Forecast] Skipped (no inventory): {skipped_no_inventory}")
    print(f"[Forecast] Skipped (not in dataset): {skipped_not_in_dataset}")

    return ForecastResponse(
        forecasts=forecasts,
        model_accuracy=MODEL_ACCURACY,
        horizon_months=horizon_months,
    )


@router.get("/chart-data")
def get_chart_data():
    """
    Returns data for:
    1. Top-6 medicines by predicted demand (bar chart)
    2. Monthly sales trend from dataset (line chart)
    """
    # --- Top-6 bar chart ---
    # We need the forecasts but can't call get_forecast here without a DB session.
    # The frontend should derive this from the main /forecast response.
    # This endpoint provides the monthly sales trend from the dataset.

    # Monthly sales trend: aggregate Quantity_Sold by Month from dataset
    if "Month" in training_df.columns and "Quantity_Sold" in training_df.columns:
        monthly = (
            training_df.groupby("Month")["Quantity_Sold"]
            .sum()
            .reset_index()
            .sort_values("Month")
        )
        month_names = {
            1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
            7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
        }
        sales_trend = [
            {
                "month": month_names.get(int(r["Month"]), str(int(r["Month"]))),
                "total_sales": int(r["Quantity_Sold"]),
            }
            for _, r in monthly.iterrows()
        ]
    else:
        sales_trend = []

    return {"monthly_sales_trend": sales_trend}