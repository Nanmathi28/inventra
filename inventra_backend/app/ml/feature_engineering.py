import pandas as pd
import numpy as np
import os
import pickle
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'processed')
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'reports')

def feature_engineering():
    """Perform feature engineering on preprocessed data."""
    print("=" * 60)
    print("STEP 3: FEATURE ENGINEERING")
    print("=" * 60)
    
    # Load processed data
    print("\nLoading processed data...")
    train_data = pd.read_csv(os.path.join(PROCESSED_DIR, 'train_data.csv'))
    test_data = pd.read_csv(os.path.join(PROCESSED_DIR, 'test_data.csv'))
    
    # Load feature info
    with open(os.path.join(PROCESSED_DIR, 'feature_info.pkl'), 'rb') as f:
        feature_info = pickle.load(f)
    
    target = feature_info['target_column']
    feature_cols = feature_info['feature_columns']
    
    print(f"Training data shape: {train_data.shape}")
    print(f"Test data shape: {test_data.shape}")
    
    # Separate features and target
    X_train = train_data[feature_cols]
    y_train = train_data[target]
    X_test = test_data[feature_cols]
    y_test = test_data[target]
    
    print(f"\nOriginal features: {len(feature_cols)}")
    print(f"Features: {feature_cols}")
    
    # Feature Engineering - Keep it simple as requested
    # The dataset already has well-engineered features:
    # - Avg_Last_7_Days_Sales, Avg_Last_30_Days_Sales (historical sales)
    # - Days_To_Expiry (time-based)
    # - Season, Month, Is_Festival (temporal features)
    # - Current_Stock, Safety_Stock, Reorder_Level (inventory features)
    # - Price (economic feature)
    # - Supplier_Lead_Time (supply chain feature)
    
    # Additional useful transformations (minimal)
    print("\nApplying minimal feature transformations...")
    
    # 1. Stock-to-Safety Ratio - indicates how much buffer we have
    X_train['Stock_to_Safety_Ratio'] = X_train['Current_Stock'] / (X_train['Safety_Stock'] + 1)
    X_test['Stock_to_Safety_Ratio'] = X_test['Current_Stock'] / (X_test['Safety_Stock'] + 1)
    
    # 2. Sales Velocity - ratio of recent sales to stock
    X_train['Sales_Velocity'] = X_train['Avg_Last_7_Days_Sales'] / (X_train['Current_Stock'] + 1)
    X_test['Sales_Velocity'] = X_test['Avg_Last_7_Days_Sales'] / (X_test['Current_Stock'] + 1)
    
    # 3. Price Category - bin price into categories (already encoded, but we can use raw)
    # Keep as is since it's already numeric after encoding
    
    # Update feature columns list
    new_features = ['Stock_to_Safety_Ratio', 'Sales_Velocity']
    updated_feature_cols = feature_cols + new_features
    
    print(f"Added features: {new_features}")
    print(f"Total features after engineering: {len(updated_feature_cols)}")
    
    # Save engineered data
    print("\nSaving engineered data...")
    
    train_engineered = pd.concat([X_train, y_train], axis=1)
    test_engineered = pd.concat([X_test, y_test], axis=1)
    
    train_engineered.to_csv(os.path.join(PROCESSED_DIR, 'train_engineered.csv'), index=False)
    test_engineered.to_csv(os.path.join(PROCESSED_DIR, 'test_engineered.csv'), index=False)
    
    print(f"Saved training data to: {os.path.join(PROCESSED_DIR, 'train_engineered.csv')}")
    print(f"Saved test data to: {os.path.join(PROCESSED_DIR, 'test_engineered.csv')}")
    
    # Update feature info
    feature_info['feature_columns'] = updated_feature_cols
    feature_info['engineered_features'] = new_features
    feature_info['n_features'] = len(updated_feature_cols)
    
    with open(os.path.join(PROCESSED_DIR, 'feature_info.pkl'), 'wb') as f:
        pickle.dump(feature_info, f)
    print(f"Updated feature info: {os.path.join(PROCESSED_DIR, 'feature_info.pkl')}")
    
    # Generate Feature Engineering Report
    print("\nGenerating Feature Engineering Report...")
    report = f"""
FEATURE ENGINEERING REPORT
==========================

Original Features: {len(feature_cols)}
Engineered Features: {len(new_features)}
Total Features: {len(updated_feature_cols)}

Original Features:
{', '.join(feature_cols)}

Engineered Features:
1. Stock_to_Safety_Ratio: Current_Stock / (Safety_Stock + 1)
   - Purpose: Indicates inventory buffer level
   - Higher values mean more safety stock available

2. Sales_Velocity: Avg_Last_7_Days_Sales / (Current_Stock + 1)
   - Purpose: Indicates how quickly stock is being depleted
   - Higher values indicate faster depletion

Features Dropped: None
Reasoning: All original features are relevant for demand prediction.
The dataset already contains well-engineered features including:
- Historical sales averages (7-day, 30-day)
- Temporal features (Season, Month, Is_Festival)
- Inventory metrics (Current_Stock, Safety_Stock, Reorder_Level)
- Supply chain metrics (Supplier_Lead_Time)
- Product attributes (Price, Category, Manufacturer)

Additional transformations were kept minimal to avoid overfitting
and maintain model interpretability.
"""
    
    with open(os.path.join(REPORTS_DIR, 'feature_engineering_report.txt'), 'w') as f:
        f.write(report)
    print(f"Saved report to: {os.path.join(REPORTS_DIR, 'feature_engineering_report.txt')}")
    
    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING COMPLETE")
    print("=" * 60)
    
    return X_train, X_test, y_train, y_test, updated_feature_cols

if __name__ == "__main__":
    X_train, X_test, y_train, y_test, feature_cols = feature_engineering()
