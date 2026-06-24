import pandas as pd
import numpy as np
import os
import pickle
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'processed')
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'ml', 'saved_models')

# Global variables for caching
_model = None
_feature_info = None
_label_encoders = None

def load_model():
    """Load the best trained model and associated artifacts."""
    global _model, _feature_info, _label_encoders
    
    if _model is not None and _feature_info is not None and _label_encoders is not None:
        return _model, _feature_info, _label_encoders
    
    print("Loading ML model and artifacts...")
    
    # Load best model
    model_path = os.path.join(MODELS_DIR, 'best_model.pkl')
    with open(model_path, 'rb') as f:
        _model = pickle.load(f)
    print(f"Loaded model from: {model_path}")
    
    # Load feature info
    feature_info_path = os.path.join(PROCESSED_DIR, 'feature_info.pkl')
    with open(feature_info_path, 'rb') as f:
        _feature_info = pickle.load(f)
    print(f"Loaded feature info from: {feature_info_path}")
    
    # Load label encoders
    encoders_path = os.path.join(PROCESSED_DIR, 'label_encoders.pkl')
    with open(encoders_path, 'rb') as f:
        _label_encoders = pickle.load(f)
    print(f"Loaded label encoders from: {encoders_path}")
    
    return _model, _feature_info, _label_encoders

def encode_categorical_features(input_data, label_encoders):
    """Encode categorical features using the fitted label encoders."""
    encoded_data = input_data.copy()
    
    for col, encoder in label_encoders.items():
        if col in encoded_data.columns:
            # Handle unseen categories by using 'Unknown' or a default value
            try:
                encoded_data[col] = encoder.transform(encoded_data[col].astype(str))
            except ValueError:
                # If unseen category, use the most common class or a default
                default_value = 0  # or encoder.transform(['Unknown'])[0] if 'Unknown' was seen during training
                encoded_data[col] = encoded_data[col].apply(
                    lambda x: encoder.transform([str(x)])[0] if str(x) in encoder.classes_ else default_value
                )
    
    return encoded_data

def add_engineered_features(input_data):
    """Add engineered features to the input data."""
    data = input_data.copy()
    
    # Stock_to_Safety_Ratio
    data['Stock_to_Safety_Ratio'] = data['Current_Stock'] / (data['Safety_Stock'] + 1)
    
    # Sales_Velocity
    data['Sales_Velocity'] = data['Avg_Last_7_Days_Sales'] / (data['Current_Stock'] + 1)
    
    return data

def predict_demand(input_data):
    """
    Predict Future_Demand using the trained ML model.
    
    Args:
        input_data: DataFrame or dict containing the required features
        
    Returns:
        Predicted Future_Demand values
    """
    # Load model and artifacts
    model, feature_info, label_encoders = load_model()
    
    # Convert dict to DataFrame if needed
    if isinstance(input_data, dict):
        input_data = pd.DataFrame([input_data])
    elif isinstance(input_data, list):
        input_data = pd.DataFrame(input_data)
    
    # Ensure all required features are present
    required_features = feature_info['feature_columns']
    original_features = [f for f in required_features if f not in ['Stock_to_Safety_Ratio', 'Sales_Velocity']]
    
    # Check for missing features
    missing_features = set(original_features) - set(input_data.columns)
    if missing_features:
        raise ValueError(f"Missing required features: {missing_features}")
    
    # Select only the original features (before engineering)
    input_data = input_data[original_features]
    
    # Encode categorical features
    input_data = encode_categorical_features(input_data, label_encoders)
    
    # Add engineered features
    input_data = add_engineered_features(input_data)
    
    # Ensure correct feature order
    input_data = input_data[required_features]
    
    # Make predictions
    predictions = model.predict(input_data)
    
    # Ensure predictions are non-negative
    predictions = np.maximum(predictions, 0)
    
    return predictions.tolist()

def predict_demand_for_medicine(medicine_data):
    """
    Predict Future_Demand for a single medicine.
    
    Args:
        medicine_data: Dict containing medicine features
        
    Returns:
        Predicted Future_Demand value
    """
    predictions = predict_demand(medicine_data)
    return predictions[0] if predictions else 0

if __name__ == "__main__":
    # Test the prediction service
    print("=" * 60)
    print("STEP 7: PREDICTION SERVICE TEST")
    print("=" * 60)
    
    # Load model
    model, feature_info, label_encoders = load_model()
    
    print(f"\nModel loaded successfully")
    print(f"Features required: {len(feature_info['feature_columns'])}")
    print(f"Feature columns: {feature_info['feature_columns']}")
    
    # Test with sample data
    print("\nTesting prediction with sample data...")
    sample_data = {
        'Category': 'Pain Relief',
        'Manufacturer': 'Mankind',
        'Medicine_Form': 'Tablet',
        'Price': 302.46,
        'Current_Stock': 244,
        'Quantity_Sold': 15,
        'Supplier_Name': 'PharmaLink',
        'Supplier_Lead_Time': 7,
        'Days_To_Expiry': 370,
        'Season': 'Winter',
        'Month': 1,
        'Is_Festival': 0,
        'Avg_Last_7_Days_Sales': 20,
        'Avg_Last_30_Days_Sales': 25,
        'Safety_Stock': 55,
        'Reorder_Level': 53,
        'Storage_Requirements': 'Room Temperature'
    }
    
    prediction = predict_demand_for_medicine(sample_data)
    print(f"Predicted Future_Demand: {prediction:.2f}")
    
    print("\n" + "=" * 60)
    print("PREDICTION SERVICE TEST COMPLETE")
    print("=" * 60)
