import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'pharmacy_dataset.csv')
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'reports')
PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'processed')

def preprocess_data():
    """Preprocess pharmacy dataset for ML training."""
    print("=" * 60)
    print("STEP 2: DATA PREPROCESSING")
    print("=" * 60)
    
    # Create directories
    os.makedirs(REPORTS_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    # Load dataset
    print(f"\nLoading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset loaded. Shape: {df.shape}")
    
    # 1. Handle Missing Values
    print("\n1. Handling Missing Values...")
    missing_before = df.isnull().sum().sum()
    print(f"   Missing values before: {missing_before}")
    
    # For numeric columns, fill with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().sum() > 0:
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
    
    # For categorical columns, fill with mode
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df[col].isnull().sum() > 0:
            mode_val = df[col].mode()[0] if not df[col].mode().empty else 'Unknown'
            df[col].fillna(mode_val, inplace=True)
    
    missing_after = df.isnull().sum().sum()
    print(f"   Missing values after: {missing_after}")
    
    # 2. Remove Duplicates
    print("\n2. Removing Duplicates...")
    duplicates_before = len(df)
    df = df.drop_duplicates()
    duplicates_after = len(df)
    print(f"   Rows before: {duplicates_before}")
    print(f"   Rows after: {duplicates_after}")
    print(f"   Duplicates removed: {duplicates_before - duplicates_after}")
    
    # 3. Feature Selection - Automatically identify usable features
    print("\n3. Feature Selection...")
    
    # Target variable
    target = 'Future_Demand'
    
    # Drop non-predictive columns (IDs, dates, text descriptions)
    columns_to_drop = [
        'Date',           # Date - not directly predictive
        'Medicine_ID',    # ID - not predictive
        'Medicine_Name',  # Name - use Category instead
        'Batch_Number',   # Batch specific - not predictive
        'Manufacturing_Date',  # Date - use Days_To_Expiry instead
        'Expiry_Date',    # Date - use Days_To_Expiry instead
        'Stock_Status',   # Derived from Current_Stock
        'Expiry_Risk',    # Derived from Days_To_Expiry
        'Reorder_Required',  # Derived from stock levels
        'Recommended_Reorder_Qty',  # This is what we want to predict indirectly
        'Demand_Level',   # Derived from Future_Demand
        'Stock_Cover_Days',  # Derived from stock and demand
        'Criticality_Level',  # Derived from stock levels
    ]
    
    # Keep only predictive features
    feature_cols = [col for col in df.columns if col not in columns_to_drop and col != target]
    
    print(f"   Selected features: {len(feature_cols)}")
    print(f"   Features: {feature_cols}")
    
    # 4. Categorical Encoding
    print("\n4. Encoding Categorical Features...")
    categorical_features = df[feature_cols].select_dtypes(include=['object']).columns.tolist()
    print(f"   Categorical features to encode: {categorical_features}")
    
    # Use Label Encoding for categorical variables
    label_encoders = {}
    for col in categorical_features:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
    
    # Save label encoders
    with open(os.path.join(PROCESSED_DIR, 'label_encoders.pkl'), 'wb') as f:
        pickle.dump(label_encoders, f)
    print(f"   Saved label encoders to: {os.path.join(PROCESSED_DIR, 'label_encoders.pkl')}")
    
    # 5. Feature Preparation
    print("\n5. Preparing Features...")
    X = df[feature_cols]
    y = df[target]
    
    print(f"   Feature matrix shape: {X.shape}")
    print(f"   Target vector shape: {y.shape}")
    
    # 6. Train/Test Split
    print("\n6. Splitting Data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"   Training set size: {X_train.shape[0]}")
    print(f"   Test set size: {X_test.shape[0]}")
    
    # 7. Save Processed Data
    print("\n7. Saving Processed Data...")
    
    train_data = pd.concat([X_train, y_train], axis=1)
    test_data = pd.concat([X_test, y_test], axis=1)
    
    train_data.to_csv(os.path.join(PROCESSED_DIR, 'train_data.csv'), index=False)
    test_data.to_csv(os.path.join(PROCESSED_DIR, 'test_data.csv'), index=False)
    
    print(f"   Saved training data to: {os.path.join(PROCESSED_DIR, 'train_data.csv')}")
    print(f"   Saved test data to: {os.path.join(PROCESSED_DIR, 'test_data.csv')}")
    
    # 8. Save Feature Information
    feature_info = {
        'feature_columns': feature_cols,
        'target_column': target,
        'categorical_features': categorical_features,
        'numeric_features': [col for col in feature_cols if col not in categorical_features],
        'n_features': len(feature_cols),
        'n_train_samples': X_train.shape[0],
        'n_test_samples': X_test.shape[0]
    }
    
    with open(os.path.join(PROCESSED_DIR, 'feature_info.pkl'), 'wb') as f:
        pickle.dump(feature_info, f)
    print(f"   Saved feature info to: {os.path.join(PROCESSED_DIR, 'feature_info.pkl')}")
    
    # 9. Generate Preprocessing Report
    print("\n8. Generating Preprocessing Report...")
    report = f"""
PREPROCESSING REPORT
====================

Original Dataset Shape: {df.shape}
Missing Values Before: {missing_before}
Missing Values After: {missing_after}
Duplicates Removed: {duplicates_before - duplicates_after}

Features Selected: {len(feature_cols)}
Target Variable: {target}

Categorical Features Encoded: {len(categorical_features)}
Numeric Features: {len(feature_cols) - len(categorical_features)}

Train/Test Split:
- Training Samples: {X_train.shape[0]}
- Test Samples: {X_test.shape[0]}
- Test Ratio: 20%

Feature Columns:
{', '.join(feature_cols)}
"""
    
    with open(os.path.join(REPORTS_DIR, 'preprocessing_report.txt'), 'w') as f:
        f.write(report)
    print(f"   Saved report to: {os.path.join(REPORTS_DIR, 'preprocessing_report.txt')}")
    
    print("\n" + "=" * 60)
    print("PREPROCESSING COMPLETE")
    print("=" * 60)
    
    return X_train, X_test, y_train, y_test, feature_cols, label_encoders

if __name__ == "__main__":
    X_train, X_test, y_train, y_test, feature_cols, label_encoders = preprocess_data()
