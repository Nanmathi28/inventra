import pandas as pd
import numpy as np
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'pharmacy_dataset.csv')
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'reports')

def analyze_dataset():
    """Analyze pharmacy dataset and generate reports."""
    print("=" * 60)
    print("STEP 1: DATA ANALYSIS")
    print("=" * 60)
    
    # Load dataset
    print(f"\nLoading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset loaded successfully. Shape: {df.shape}")
    
    # Create reports directory if it doesn't exist
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    # 1. Dataset Summary
    print("\n1. Generating Dataset Summary...")
    summary = {
        'Total Rows': len(df),
        'Total Columns': len(df.columns),
        'Columns': list(df.columns),
        'Memory Usage (MB)': df.memory_usage(deep=True).sum() / 1024 / 1024,
        'Numeric Columns': list(df.select_dtypes(include=[np.number]).columns),
        'Categorical Columns': list(df.select_dtypes(include=['object']).columns),
        'Date Columns': list(df.select_dtypes(include=['datetime64']).columns)
    }
    
    with open(os.path.join(REPORTS_DIR, 'dataset_summary.txt'), 'w') as f:
        f.write("=" * 60 + "\n")
        f.write("DATASET SUMMARY\n")
        f.write("=" * 60 + "\n\n")
        for key, value in summary.items():
            f.write(f"{key}: {value}\n")
    print(f"   Saved: {os.path.join(REPORTS_DIR, 'dataset_summary.txt')}")
    
    # 2. Missing Value Report
    print("\n2. Generating Missing Value Report...")
    missing_report = df.isnull().sum()
    missing_percentage = (df.isnull().sum() / len(df)) * 100
    
    missing_df = pd.DataFrame({
        'Column': df.columns,
        'Missing Count': missing_report.values,
        'Missing Percentage': missing_percentage.values
    })
    
    missing_df.to_csv(os.path.join(REPORTS_DIR, 'missing_value_report.csv'), index=False)
    print(f"   Saved: {os.path.join(REPORTS_DIR, 'missing_value_report.csv')}")
    
    # 3. Feature Type Report
    print("\n3. Generating Feature Type Report...")
    feature_types = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        unique_count = df[col].nunique()
        feature_types.append({
            'Column': col,
            'Data Type': dtype,
            'Unique Values': unique_count,
            'Sample Values': str(df[col].head(3).tolist()) if unique_count <= 10 else 'Too many to display'
        })
    
    feature_df = pd.DataFrame(feature_types)
    feature_df.to_csv(os.path.join(REPORTS_DIR, 'feature_type_report.csv'), index=False)
    print(f"   Saved: {os.path.join(REPORTS_DIR, 'feature_type_report.csv')}")
    
    # 4. Correlation Analysis
    print("\n4. Generating Correlation Analysis...")
    numeric_df = df.select_dtypes(include=[np.number])
    correlation_matrix = numeric_df.corr()
    
    # Save correlation matrix
    correlation_matrix.to_csv(os.path.join(REPORTS_DIR, 'correlation_matrix.csv'))
    print(f"   Saved: {os.path.join(REPORTS_DIR, 'correlation_matrix.csv')}")
    
    # Correlation with target variable (Future_Demand)
    if 'Future_Demand' in correlation_matrix.columns:
        target_correlation = correlation_matrix['Future_Demand'].abs().sort_values(ascending=False)
        target_correlation.to_csv(os.path.join(REPORTS_DIR, 'target_correlation.csv'))
        print(f"   Saved: {os.path.join(REPORTS_DIR, 'target_correlation.csv')}")
    
    # 5. Feature Suitability Analysis
    print("\n5. Generating Feature Suitability Analysis...")
    suitability_report = []
    
    for col in df.columns:
        if col == 'Future_Demand':
            continue
        
        dtype = str(df[col].dtype)
        missing_pct = (df[col].isnull().sum() / len(df)) * 100
        unique_count = df[col].nunique()
        
        # Determine suitability
        if dtype in ['int64', 'float64']:
            if missing_pct < 5:
                suitability = 'High'
                reason = 'Numeric feature with low missing values'
            elif missing_pct < 20:
                suitability = 'Medium'
                reason = 'Numeric feature with moderate missing values'
            else:
                suitability = 'Low'
                reason = 'Numeric feature with high missing values'
        elif dtype == 'object':
            if unique_count < 50 and missing_pct < 5:
                suitability = 'Medium'
                reason = 'Categorical feature with low cardinality'
            elif unique_count < 100:
                suitability = 'Low'
                reason = 'Categorical feature with high cardinality'
            else:
                suitability = 'Very Low'
                reason = 'Categorical feature with very high cardinality'
        else:
            suitability = 'Medium'
            reason = 'Date/other feature - requires transformation'
        
        suitability_report.append({
            'Feature': col,
            'Data Type': dtype,
            'Missing %': round(missing_pct, 2),
            'Unique Values': unique_count,
            'Suitability': suitability,
            'Reason': reason
        })
    
    suitability_df = pd.DataFrame(suitability_report)
    suitability_df.to_csv(os.path.join(REPORTS_DIR, 'feature_suitability.csv'), index=False)
    print(f"   Saved: {os.path.join(REPORTS_DIR, 'feature_suitability.csv')}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("DATA ANALYSIS COMPLETE")
    print("=" * 60)
    print(f"\nDataset Shape: {df.shape}")
    print(f"Target Variable: Future_Demand")
    print(f"Numeric Features: {len(numeric_df.columns)}")
    print(f"Categorical Features: {len(df.select_dtypes(include=['object']).columns)}")
    print(f"\nAll reports saved to: {REPORTS_DIR}")
    
    return df

if __name__ == "__main__":
    analyze_dataset()
