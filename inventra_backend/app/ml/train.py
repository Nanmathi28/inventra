import pandas as pd
import numpy as np
import os
import pickle
import sys
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'processed')
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'ml', 'saved_models')
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'reports')

def train_models():
    """Train multiple regression models for demand forecasting."""
    print("=" * 60)
    print("STEP 4: MODEL TRAINING")
    print("=" * 60)
    
    # Create models directory
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Load engineered data
    print("\nLoading engineered data...")
    train_data = pd.read_csv(os.path.join(PROCESSED_DIR, 'train_engineered.csv'))
    test_data = pd.read_csv(os.path.join(PROCESSED_DIR, 'test_engineered.csv'))
    
    # Load feature info
    with open(os.path.join(PROCESSED_DIR, 'feature_info.pkl'), 'rb') as f:
        feature_info = pickle.load(f)
    
    target = feature_info['target_column']
    feature_cols = feature_info['feature_columns']
    
    # Separate features and target
    X_train = train_data[feature_cols]
    y_train = train_data[target]
    X_test = test_data[feature_cols]
    y_test = test_data[target]
    
    print(f"Training data shape: {X_train.shape}")
    print(f"Test data shape: {X_test.shape}")
    print(f"Features: {len(feature_cols)}")
    
    # Initialize models
    models = {
        'Linear Regression': LinearRegression(),
        'Decision Tree': DecisionTreeRegressor(random_state=42, max_depth=10),
        'Random Forest': RandomForestRegressor(random_state=42, n_estimators=100, max_depth=15),
        'XGBoost': XGBRegressor(random_state=42, n_estimators=100, max_depth=10, learning_rate=0.1)
    }
    
    # Train each model
    trained_models = {}
    training_results = []
    
    print("\nTraining models...")
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        
        # Calculate training score
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        
        print(f"  Training R² Score: {train_score:.4f}")
        print(f"  Test R² Score: {test_score:.4f}")
        
        # Save model
        model_filename = name.lower().replace(' ', '_') + '.pkl'
        model_path = os.path.join(MODELS_DIR, model_filename)
        
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        print(f"  Saved to: {model_path}")
        
        trained_models[name] = model
        training_results.append({
            'Model': name,
            'Train_R2': train_score,
            'Test_R2': test_score,
            'Model_File': model_filename
        })
    
    # Save training results
    results_df = pd.DataFrame(training_results)
    results_df.to_csv(os.path.join(REPORTS_DIR, 'training_results.csv'), index=False)
    print(f"\nSaved training results to: {os.path.join(REPORTS_DIR, 'training_results.csv')}")
    
    # Generate training report
    report = f"""
MODEL TRAINING REPORT
=====================

Dataset Information:
- Training Samples: {X_train.shape[0]}
- Test Samples: {X_test.shape[0]}
- Features: {len(feature_cols)}
- Target Variable: {target}

Models Trained:
"""
    for result in training_results:
        report += f"""
{result['Model']}
- Training R² Score: {result['Train_R2']:.4f}
- Test R² Score: {result['Test_R2']:.4f}
- Model File: {result['Model_File']}
"""
    
    report += f"""
Model Hyperparameters:
- Linear Regression: Default parameters
- Decision Tree: max_depth=10, random_state=42
- Random Forest: n_estimators=100, max_depth=15, random_state=42
- XGBoost: n_estimators=100, max_depth=10, learning_rate=0.1, random_state=42

All models saved to: {MODELS_DIR}
"""
    
    with open(os.path.join(REPORTS_DIR, 'training_report.txt'), 'w') as f:
        f.write(report)
    print(f"Saved training report to: {os.path.join(REPORTS_DIR, 'training_report.txt')}")
    
    print("\n" + "=" * 60)
    print("MODEL TRAINING COMPLETE")
    print("=" * 60)
    
    return trained_models, X_test, y_test, feature_cols

if __name__ == "__main__":
    trained_models, X_test, y_test, feature_cols = train_models()
