from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.preprocessing import StandardScaler

try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None


def get_classifiers() -> Dict[str, Any]:
    """Returns the suite of 4 core classifiers evaluated in the study."""
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "SVM (Linear)": SVC(kernel="linear", probability=True, random_state=42),
        "SVM (RBF)": SVC(kernel="rbf", probability=True, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
    }
    if XGBClassifier is not None:
        models["XGBoost"] = XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05, eval_metric="logloss", random_state=42)
    return models


def evaluate_representation_models(
    df: pd.DataFrame, 
    rep_name: str
) -> Tuple[List[Dict[str, Any]], Dict[str, Any], List[Dict[str, Any]]]:
    """
    Evaluates ML models using Subject-Independent Group-KFold cross validation.
    
    Returns:
    - metrics_list: benchmark metrics per classifier
    - roc_curves: TPR/FPR values for plotting
    - feature_importance: top ranked features
    """
    meta_cols = ["subject_id", "group", "label", "state"]
    feature_cols = [c for c in df.columns if c not in meta_cols]
    
    X = df[feature_cols].values
    y = df["label"].values.astype(int)
    groups = df["subject_id"].values
    
    unique_groups = np.unique(groups)
    n_splits = min(5, len(unique_groups))
    
    if n_splits < 2:
        # Fallback if only 1 subject
        n_splits = 2
        groups = np.arange(len(y)) % 2
        
    gkf = GroupKFold(n_splits=n_splits)
    classifiers = get_classifiers()
    
    results = []
    roc_dict = {}
    feature_importances = []
    
    for name, model in classifiers.items():
        y_trues, y_preds, y_probs = [], [], []
        fold_importances = []
        
        for train_idx, test_idx in gkf.split(X, y, groups=groups):
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]
            
            # Check single-class fold protection
            if len(np.unique(y_train)) < 2:
                continue
                
            scaler = StandardScaler()
            X_train_sc = scaler.fit_transform(X_train)
            X_test_sc = scaler.transform(X_test)
            
            model.fit(X_train_sc, y_train)
            y_pred = model.predict(X_test_sc)
            
            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_test_sc)[:, 1]
            else:
                y_prob = y_pred
                
            y_trues.extend(y_test)
            y_preds.extend(y_pred)
            y_probs.extend(y_prob)
            
            # Feature importance
            if hasattr(model, "feature_importances_"):
                fold_importances.append(model.feature_importances_)
            elif hasattr(model, "coef_"):
                fold_importances.append(np.abs(model.coef_[0]))
                
        if len(y_trues) > 0:
            acc = float(accuracy_score(y_trues, y_preds))
            prec = float(precision_score(y_trues, y_preds, zero_division=0))
            rec = float(recall_score(y_trues, y_preds, zero_division=0))
            f1 = float(f1_score(y_trues, y_preds, zero_division=0))
            try:
                auc = float(roc_auc_score(y_trues, y_probs))
            except Exception:
                auc = 0.5
                
            cm = confusion_matrix(y_trues, y_preds).tolist()
            
            results.append({
                "representation": rep_name,
                "model": name,
                "accuracy": round(acc * 100, 2),
                "precision": round(prec * 100, 2),
                "recall": round(rec * 100, 2),
                "f1_score": round(f1 * 100, 2),
                "auc_roc": round(auc, 3),
                "confusion_matrix": cm
            })
            
            # Aggregate feature importances for tree-based models
            if name in ["Random Forest", "XGBoost"] and fold_importances:
                mean_imp = np.mean(fold_importances, axis=0)
                for f_idx, feat in enumerate(feature_cols):
                    feature_importances.append({
                        "feature": feat,
                        "importance": round(float(mean_imp[f_idx]), 4),
                        "model": name,
                        "representation": rep_name
                    })
                    
    # Sort feature importances
    feature_importances = sorted(feature_importances, key=lambda x: x["importance"], reverse=True)[:15]
    
    return results, roc_dict, feature_importances
