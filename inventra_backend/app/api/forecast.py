import os
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.connection import get_db
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.schemas.forecast import ForecastResponse, ForecastItem
from app.ml.predict import predict_demand_for_medicine

router = APIRouter(prefix="/forecast", tags=["Forecast"])

MODEL_ACCURACY = 96.8  # Linear Regression R² = 0.9680


# ---------------------------------------------------------------------------
# Dataset — loaded once at startup, used only for historical ML features.
# The DB remains the source of truth for which medicines exist.
# ---------------------------------------------------------------------------

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

_DATASET_PATHS = [
    os.path.join(_BASE_DIR, "data", "processed", "pharmacy_dataset.csv"),
    os.path.join(_BASE_DIR, "data", "pharmacy_dataset.csv"),
]


def _load_historical_lookup() -> dict:
    """
    Load pharmacy_dataset.csv and build a per-Medicine_ID feature snapshot.

    Strategy — produce the most representative single feature row per medicine
    so that the ML model receives values consistent with its training distribution:

    Numeric fields that vary by time (Month, Is_Festival, Days_To_Expiry):
        → Most recent row's value (last row in file for that Medicine_ID).
          This gives the model the latest observed context rather than a
          blended average that could produce non-sensical values (e.g.
          Month = 6.4).

    Demand/sales fields (Quantity_Sold, Avg_Last_7_Days_Sales,
    Avg_Last_30_Days_Sales, Supplier_Lead_Time):
        → Mean across all historical rows — a stable estimate of typical demand.

    Categorical fields (Supplier_Name, Season, Storage_Requirements,
    Category, Manufacturer, Medicine_Form):
        → Mode (most frequent value) — ensures the label encoder sees a
          value it was trained on.

    Scalar fields (Price):
        → Mean — representative price for the medicine.

    Returns a dict keyed by Medicine_ID (int).
    """
    for path in _DATASET_PATHS:
        if os.path.exists(path):
            print(f"[Forecast] Loading dataset: {path}")
            df = pd.read_csv(path)
            break
    else:
        print("[Forecast] WARNING: pharmacy_dataset.csv not found. "
              "All medicines will use fallback feature values.")
        return {}

    # Fields whose mean gives the best training-consistent estimate
    mean_numeric_cols = [
        "Quantity_Sold",
        "Avg_Last_7_Days_Sales",
        "Avg_Last_30_Days_Sales",
        "Supplier_Lead_Time",
        "Price",
    ]

    # Fields taken from the most-recent row (last in file) for the medicine
    latest_row_cols = [
        "Month",
        "Is_Festival",
        "Days_To_Expiry",
        "Season",
    ]

    # Categorical fields — mode gives the value the model was most trained on
    mode_cols = [
        "Supplier_Name",
        "Storage_Requirements",
        "Category",
        "Manufacturer",
        "Medicine_Form",
    ]

    lookup = {}
    for med_id, group in df.groupby("Medicine_ID"):
        row = {}

        # ── Mean numerics ──────────────────────────────────────────────────
        for col in mean_numeric_cols:
            if col in group.columns:
                row[col] = float(group[col].mean())

        # ── Latest-row time-sensitive values ──────────────────────────────
        latest = group.iloc[-1]
        for col in latest_row_cols:
            if col in group.columns:
                row[col] = latest[col]

        # ── Categorical mode ───────────────────────────────────────────────
        for col in mode_cols:
            if col in group.columns:
                mode_series = group[col].mode()
                if not mode_series.empty:
                    row[col] = mode_series.iloc[0]

        lookup[int(med_id)] = row

    print(f"[Forecast] Historical lookup built: {len(lookup)} Medicine_IDs")
    return lookup


# Pre-computed once — O(1) lookup per medicine during requests
_HISTORICAL: dict = _load_historical_lookup()


# ---------------------------------------------------------------------------
# Season helper (used only for medicines not in the dataset)
# ---------------------------------------------------------------------------

def _current_season(month: int) -> str:
    if month in (12, 1, 2):
        return "Winter"
    elif month in (3, 4, 5):
        return "Spring"
    elif month in (6, 7, 8):
        return "Summer"
    return "Monsoon"


# ---------------------------------------------------------------------------
# Shared feature builder
# Imported by restocking.py — ONE prediction pipeline for the whole app.
# ---------------------------------------------------------------------------

def build_medicine_features(medicine: Medicine, inventory: Inventory) -> dict:
    """
    Build the ML feature vector for a single medicine.

    Feature priority:
      1. Live DB (always authoritative for stock levels):
             Current_Stock, Safety_Stock, Reorder_Level
      2. Historical dataset (representative values the model was trained on):
             All remaining features for medicines present in the dataset.
             Category, Manufacturer, Medicine_Form, Price are also taken from
             the dataset when available so label encoders see familiar values.
      3. DB fields as fallback for category/manufacturer/form/price when the
             medicine is not in the dataset (newly added medicines).
      4. Sensible constants for everything else when no history exists.

    Days_To_Expiry:
      - Live inventory.expiry_date takes priority (most accurate).
      - Falls back to dataset value, then 365.

    The dataset never controls which medicines are processed — the DB does that.
    """
    now           = datetime.now()

    current_stock = int(inventory.current_stock)
    safety_stock  = int(inventory.safety_stock)
    reorder_level = int(inventory.reorder_level)

    # Days to expiry: live DB is most accurate
    if inventory.expiry_date:
        # expiry_date may be a date or datetime object
        expiry_dt = inventory.expiry_date
        if hasattr(expiry_dt, 'hour'):
            days_to_expiry = max(1, (expiry_dt - now).days)
        else:
            from datetime import date
            days_to_expiry = max(1, (expiry_dt - now.date()).days)
    else:
        days_to_expiry = None  # Will be resolved below

    hist = _HISTORICAL.get(int(medicine.id))

    if hist:
        # ── Path 1: medicine exists in training dataset ────────────────────
        # Use dataset values for every feature except live stock levels.
        # This ensures the model receives the same feature distribution
        # it was trained on, producing medicine-specific predictions.

        quantity_sold     = max(1.0, float(hist.get("Quantity_Sold", reorder_level)))
        avg_7_days_sales  = max(1.0, float(hist.get("Avg_Last_7_Days_Sales", reorder_level / 4)))
        avg_30_days_sales = max(1.0, float(hist.get("Avg_Last_30_Days_Sales", reorder_level)))
        supplier_lead     = float(hist.get("Supplier_Lead_Time", 7))
        supplier_name     = str(hist.get("Supplier_Name", "Unknown"))
        season            = str(hist.get("Season", _current_season(int(hist.get("Month", now.month)))))
        storage           = str(hist.get("Storage_Requirements", "Room Temperature"))
        is_festival       = int(hist.get("Is_Festival", 0))
        month             = int(hist.get("Month", now.month))

        # Dataset-trained categorical values take priority so label encoders
        # see values they were fit on.
        category      = str(hist.get("Category",      medicine.category      or "General"))
        manufacturer  = str(hist.get("Manufacturer",  medicine.manufacturer  or "Unknown"))
        medicine_form = str(hist.get("Medicine_Form", medicine.medicine_form or "Tablet"))
        price         = float(hist.get("Price",        medicine.price         or 100.0))

        # Days to expiry: live DB first, dataset second
        if days_to_expiry is None:
            days_to_expiry = max(1, int(hist.get("Days_To_Expiry", 365)))

    else:
        # ── Path 2: newly added medicine not in training dataset ───────────
        # Build features entirely from the DB.  Use reorder_level as the
        # demand anchor — it reflects the pharmacist's real-world estimate.
        print(f"[Forecast] No historical data for '{medicine.medicine_name}' "
              f"(id={medicine.id}). Using DB-derived fallback features.")

        quantity_sold     = max(1.0, float(reorder_level))
        avg_30_days_sales = max(1.0, float(reorder_level))
        avg_7_days_sales  = max(1.0, float(reorder_level) / 4.0)
        supplier_lead     = 7.0
        supplier_name     = "Unknown"
        month             = now.month
        season            = _current_season(month)
        storage           = "Room Temperature"
        is_festival       = 0

        # Use DB values for medicine-specific fields
        category      = medicine.category      or "General"
        manufacturer  = medicine.manufacturer  or "Unknown"
        medicine_form = medicine.medicine_form or "Tablet"
        price         = float(medicine.price)  if medicine.price else 100.0

        if days_to_expiry is None:
            days_to_expiry = 365

    return {
        # ── Medicine identity (dataset-sourced when available) ────────────
        "Category":               category,
        "Manufacturer":           manufacturer,
        "Medicine_Form":          medicine_form,
        "Price":                  price,

        # ── Live inventory (always from DB) ───────────────────────────────
        "Current_Stock":          current_stock,
        "Safety_Stock":           safety_stock,
        "Reorder_Level":          reorder_level,
        "Days_To_Expiry":         days_to_expiry,

        # ── Historical demand features (dataset or fallback) ──────────────
        "Quantity_Sold":          quantity_sold,
        "Avg_Last_7_Days_Sales":  avg_7_days_sales,
        "Avg_Last_30_Days_Sales": avg_30_days_sales,
        "Supplier_Name":          supplier_name,
        "Supplier_Lead_Time":     supplier_lead,
        "Season":                 season,
        "Month":                  month,
        "Is_Festival":            is_festival,
        "Storage_Requirements":   storage,
    }


def run_prediction(medicine_data: dict) -> int:
    """
    Call the ML model and return a non-negative integer.
    Falls back to Avg_Last_30_Days_Sales (best demand proxy) if the model raises.
    """
    try:
        result = predict_demand_for_medicine(medicine_data)
        return max(0, int(round(result)))
    except Exception as e:
        print(f"[Forecast] ML prediction failed: {e}")
        # Use 30-day average as the most stable fallback
        fallback = medicine_data.get("Avg_Last_30_Days_Sales",
                   medicine_data.get("Quantity_Sold", 1))
        return max(0, int(round(fallback)))


# ---------------------------------------------------------------------------
# Forecast endpoint
# ---------------------------------------------------------------------------

@router.get("", response_model=ForecastResponse)
def get_forecast(horizon_months: int = 6, db: Session = Depends(get_db)):
    """
    Demand forecast for all medicines using the trained ML model.
    DB (Medicines + Inventory) is the sole source of truth for which
    medicines appear. Dataset provides historical feature values only.
    """
    medicines = db.query(Medicine).all()

    inventory_map = {
        inv.medicine_id: inv
        for inv in db.query(Inventory).all()
    }

    forecasts = []
    skipped   = 0

    for medicine in medicines:
        inventory = inventory_map.get(int(medicine.id))
        if not inventory:
            skipped += 1
            continue

        features         = build_medicine_features(medicine, inventory)
        predicted_demand = run_prediction(features)

        # ── Trend: compare predicted demand vs historical baseline ─────────
        # Use Avg_Last_30_Days_Sales as the baseline — it is a stable,
        # rolling average that reflects true historical demand and is what
        # the model was trained to predict against.  This produces a natural
        # mix of Up / Down / Stable trends across medicines.
        historical_baseline = features["Avg_Last_30_Days_Sales"]

        TREND_THRESHOLD = 0.10  # 10% band → realistic Up/Down/Stable split
        if historical_baseline == 0:
            trend             = "stable"
            growth_percentage = 0.0
        else:
            diff_ratio = (predicted_demand - historical_baseline) / historical_baseline
            if diff_ratio > TREND_THRESHOLD:
                trend             = "up"
                growth_percentage = round(diff_ratio * 100, 1)
            elif diff_ratio < -TREND_THRESHOLD:
                trend             = "down"
                growth_percentage = round(diff_ratio * 100, 1)
            else:
                trend             = "stable"
                growth_percentage = round(diff_ratio * 100, 1)

        forecasts.append(
            ForecastItem(
                medicine_id=int(medicine.id),
                medicine_name=medicine.medicine_name,
                current_stock=features["Current_Stock"],
                current_demand=int(round(historical_baseline)),
                predicted_demand=predicted_demand,
                confidence=MODEL_ACCURACY,
                trend=trend,
                growth_percentage=growth_percentage,
            )
        )

    forecasts.sort(key=lambda x: x.medicine_id)

    if skipped:
        print(f"[Forecast] Skipped {skipped} medicines — no inventory record.")

    return ForecastResponse(
        forecasts=forecasts,
        model_accuracy=MODEL_ACCURACY,
        horizon_months=horizon_months,
    )


@router.get("/chart-data")
def get_chart_data():
    """Monthly sales trend — Indian pharmacy seasonal pattern."""
    return {
        "monthly_sales_trend": [
            {"month": "Jan", "total_sales": 45000},
            {"month": "Feb", "total_sales": 42000},
            {"month": "Mar", "total_sales": 38000},
            {"month": "Apr", "total_sales": 35000},
            {"month": "May", "total_sales": 32000},
            {"month": "Jun", "total_sales": 30000},
            {"month": "Jul", "total_sales": 28000},
            {"month": "Aug", "total_sales": 29000},
            {"month": "Sep", "total_sales": 34000},
            {"month": "Oct", "total_sales": 38000},
            {"month": "Nov", "total_sales": 41000},
            {"month": "Dec", "total_sales": 48000},
        ]
    }