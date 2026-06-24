import pandas as pd
import numpy as np
import os
import pickle
import sys
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'processed')
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'ml', 'saved_models')
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'reports')

def calculate_mape(y_true, y_pred):
    """Calculate Mean Absolute Percentage Error."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    # Avoid division by zero
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

def evaluate_models():
    """Evaluate all trained models and generate reports."""
    print("=" * 60)
    print("STEP 5: MODEL EVALUATION")
    print("=" * 60)
    
    # Load test data
    print("\nLoading test data...")
    test_data = pd.read_csv(os.path.join(PROCESSED_DIR, 'test_engineered.csv'))
    
    # Load feature info
    with open(os.path.join(PROCESSED_DIR, 'feature_info.pkl'), 'rb') as f:
        feature_info = pickle.load(f)
    
    target = feature_info['target_column']
    feature_cols = feature_info['feature_columns']
    
    X_test = test_data[feature_cols]
    y_test = test_data[target]
    
    print(f"Test data shape: {X_test.shape}")
    
    # Load trained models
    models = {
        'Linear Regression': 'linear_regression.pkl',
        'Decision Tree': 'decision_tree.pkl',
        'Random Forest': 'random_forest.pkl',
        'XGBoost': 'xgboost.pkl'
    }
    
    evaluation_results = []
    predictions = {}
    
    print("\nEvaluating models...")
    for name, model_file in models.items():
        print(f"\nEvaluating {name}...")
        
        # Load model
        with open(os.path.join(MODELS_DIR, model_file), 'rb') as f:
            model = pickle.load(f)
        
        # Make predictions
        y_pred = model.predict(X_test)
        predictions[name] = y_pred
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mape = calculate_mape(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"  MAE: {mae:.4f}")
        print(f"  RMSE: {rmse:.4f}")
        print(f"  MAPE: {mape:.4f}%")
        print(f"  R² Score: {r2:.4f}")
        
        evaluation_results.append({
            'Model': name,
            'MAE': mae,
            'RMSE': rmse,
            'MAPE': mape,
            'R2_Score': r2
        })
    
    # Save evaluation metrics
    eval_df = pd.DataFrame(evaluation_results)
    eval_df.to_csv(os.path.join(REPORTS_DIR, 'evaluation_metrics.csv'), index=False)
    print(f"\nSaved evaluation metrics to: {os.path.join(REPORTS_DIR, 'evaluation_metrics.csv')}")
    
    # Generate model comparison CSV
    comparison_df = eval_df.sort_values('R2_Score', ascending=False)
    comparison_df.to_csv(os.path.join(REPORTS_DIR, 'model_comparison.csv'), index=False)
    print(f"Saved model comparison to: {os.path.join(REPORTS_DIR, 'model_comparison.csv')}")
    
    # Generate visualizations
    print("\nGenerating visualizations...")
    
    # 1. Actual vs Predicted plot for best model
    best_model = comparison_df.iloc[0]['Model']
    y_pred_best = predictions[best_model]
    
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, y_pred_best, alpha=0.5, s=10)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
    plt.xlabel('Actual Future Demand')
    plt.ylabel('Predicted Future Demand')
    plt.title(f'Actual vs Predicted - {best_model}')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, 'actual_vs_predicted.png'), dpi=150)
    plt.close()
    print(f"  Saved: actual_vs_predicted.png")
    
    # 2. Model comparison bar chart
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    
    metrics = ['MAE', 'RMSE', 'MAPE', 'R2_Score']
    titles = ['Mean Absolute Error', 'Root Mean Squared Error', 'Mean Absolute Percentage Error', 'R² Score']
    
    for idx, (metric, title) in enumerate(zip(metrics, titles)):
        ax = axes[idx // 2, idx % 2]
        colors = ['#2ecc71' if metric == 'R2_Score' else '#e74c3c']
        bars = ax.bar(eval_df['Model'], eval_df[metric], color=colors)
        ax.set_title(title, fontsize=12, fontweight='bold')
        ax.set_ylabel(metric)
        ax.tick_params(axis='x', rotation=45)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.2f}', ha='center', va='bottom', fontsize=9)
    
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, 'model_comparison.png'), dpi=150)
    plt.close()
    print(f"  Saved: model_comparison.png")
    
    # 3. Feature importance (for tree-based models)
    tree_models = ['Decision Tree', 'Random Forest', 'XGBoost']
    for model_name in tree_models:
        if model_name in predictions:
            with open(os.path.join(MODELS_DIR, models[model_name]), 'rb') as f:
                model = pickle.load(f)
            
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
                indices = np.argsort(importances)[::-1]
                
                plt.figure(figsize=(12, 8))
                plt.title(f'Feature Importance - {model_name}', fontsize=14, fontweight='bold')
                plt.bar(range(len(importances)), importances[indices], align='center', color='#3498db')
                plt.xticks(range(len(importances)), [feature_cols[i] for i in indices], rotation=90, ha='right')
                plt.xlabel('Features')
                plt.ylabel('Importance')
                plt.tight_layout()
                plt.savefig(os.path.join(REPORTS_DIR, f'feature_importance_{model_name.lower().replace(" ", "_")}.png'), dpi=150)
                plt.close()
                print(f"  Saved: feature_importance_{model_name.lower().replace(' ', '_')}.png")
    
    # Generate evaluation report
    report = f"""
MODEL EVALUATION REPORT
=======================

Test Dataset:
- Samples: {X_test.shape[0]}
- Features: {len(feature_cols)}

Evaluation Metrics (Lower is better for MAE, RMSE, MAPE; Higher is better for R²):
"""
    for result in evaluation_results:
        report += f"""
{result['Model']}
- Mean Absolute Error (MAE): {result['MAE']:.4f}
- Root Mean Squared Error (RMSE): {result['RMSE']:.4f}
- Mean Absolute Percentage Error (MAPE): {result['MAPE']:.4f}%
- R² Score: {result['R2_Score']:.4f}
"""
    
    report += f"""
Model Ranking (by R² Score):
"""
    for idx, row in comparison_df.iterrows():
        report += f"{idx + 1}. {row['Model']} - R²: {row['R2_Score']:.4f}\n"
    
    report += f"""
Visualizations Generated:
- actual_vs_predicted.png: Scatter plot of actual vs predicted values for best model
- model_comparison.png: Bar charts comparing all models on all metrics
- feature_importance_*.png: Feature importance plots for tree-based models

All reports saved to: {REPORTS_DIR}
"""
    
    with open(os.path.join(REPORTS_DIR, 'evaluation_report.txt'), 'w') as f:
        f.write(report)
    print(f"Saved evaluation report to: {os.path.join(REPORTS_DIR, 'evaluation_report.txt')}")
    
    print("\n" + "=" * 60)
    print("MODEL EVALUATION COMPLETE")
    print("=" * 60)
    
    # Step 6: Best Model Selection
    print("\n" + "=" * 60)
    print("STEP 6: BEST MODEL SELECTION")
    print("=" * 60)
    
    # Select best model based on R² score
    best_model_name = comparison_df.iloc[0]['Model']
    best_model_file = best_model_name.lower().replace(' ', '_') + '.pkl'
    best_r2_score = comparison_df.iloc[0]['R2_Score']
    
    print(f"\nBest Model: {best_model_name}")
    print(f"R² Score: {best_r2_score:.4f}")
    
    # Load best model
    with open(os.path.join(MODELS_DIR, best_model_file), 'rb') as f:
        best_model = pickle.load(f)
    
    # Save as best_model.pkl
    best_model_path = os.path.join(MODELS_DIR, 'best_model.pkl')
    with open(best_model_path, 'wb') as f:
        pickle.dump(best_model, f)
    
    print(f"Saved best model to: {best_model_path}")
    
    # Generate model summary
    model_summary = f"""
MODEL SELECTION SUMMARY
=======================

Best Model Selected: {best_model_name}
R² Score: {best_r2_score:.4f}

Justification:
- {best_model_name} achieved the highest R² score among all models
- R² score of {best_r2_score:.4f} indicates {best_r2_score*100:.2f}% of variance in Future_Demand is explained by the model
- If scores were very close, simpler models would be preferred
- {best_model_name} is {'the simplest model' if best_model_name == 'Linear Regression' else 'a more complex model'} with excellent performance

Evaluation Metrics for Best Model:
"""
    for result in evaluation_results:
        if result['Model'] == best_model_name:
            model_summary += f"- MAE: {result['MAE']:.4f}\n"
            model_summary += f"- RMSE: {result['RMSE']:.4f}\n"
            model_summary += f"- MAPE: {result['MAPE']:.4f}%\n"
            model_summary += f"- R² Score: {result['R2_Score']:.4f}\n"
    
    model_summary += f"""
Features Used ({len(feature_cols)}):
{', '.join(feature_cols)}

Model File: best_model.pkl
Location: {MODELS_DIR}
"""
    
    with open(os.path.join(REPORTS_DIR, 'model_summary.txt'), 'w') as f:
        f.write(model_summary)
    print(f"Saved model summary to: {os.path.join(REPORTS_DIR, 'model_summary.txt')}")
    
    print("\n" + "=" * 60)
    print("BEST MODEL SELECTION COMPLETE")
    print("=" * 60)
    
    return evaluation_results, predictions, best_model_name

if __name__ == "__main__":
    evaluation_results, predictions, best_model_name = evaluate_models()
