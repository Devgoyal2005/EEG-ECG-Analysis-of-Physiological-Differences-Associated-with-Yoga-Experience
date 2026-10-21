from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, adjusted_rand_score
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

def perform_kmeans_clustering(
    df: pd.DataFrame, 
    k_range: Tuple[int, int] = (2, 6)
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
    """
    Performs unsupervised K-Means clustering without practitioner labels.
    Calculates silhouette scores across k_range and 2D PCA projection for visualization.
    """
    meta_cols = ["subject_id", "group", "label", "state"]
    feature_cols = [c for c in df.columns if c not in meta_cols]
    
    X = df[feature_cols].values
    y_true = df["label"].values.astype(int)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 2D PCA projection for scatter plot in UI
    pca = PCA(n_components=2, random_state=42)
    pca_coords = pca.fit_transform(X_scaled)
    
    sweep_results = []
    best_k = 2
    best_sil = -1.0
    best_kmeans = None
    
    for k in range(k_range[0], min(k_range[1] + 1, len(df))):
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)
        
        sil = float(silhouette_score(X_scaled, labels))
        ari = float(adjusted_rand_score(y_true, labels)) if k == 2 else 0.0
        
        sweep_results.append({
            "k": k,
            "silhouette_score": round(sil, 4),
            "adjusted_rand_index": round(ari, 4),
            "inertia": round(float(kmeans.inertia_), 2)
        })
        
        if sil > best_sil:
            best_sil = sil
            best_k = k
            best_kmeans = kmeans
            
    # Apply optimal K-Means
    if best_kmeans is None:
        best_kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
        best_kmeans.fit(X_scaled)
        
    final_clusters = best_kmeans.labels_
    
    # Create cluster visualization points
    scatter_points = []
    for i in range(len(df)):
        scatter_points.append({
            "pca_x": round(float(pca_coords[i, 0]), 4),
            "pca_y": round(float(pca_coords[i, 1]), 4),
            "cluster": int(final_clusters[i]),
            "true_group": str(df.iloc[i].get("group", "unknown")),
            "state": str(df.iloc[i].get("state", "unknown")),
            "subject_id": str(df.iloc[i].get("subject_id", f"S_{i}"))
        })
        
    # Calculate Cluster Purity for K=2
    cluster_0_experts = sum(1 for p in scatter_points if p["cluster"] == 0 and p["true_group"] == "expert")
    cluster_0_total = max(1, sum(1 for p in scatter_points if p["cluster"] == 0))
    purity_0 = round((cluster_0_experts / cluster_0_total) * 100, 1)
    
    cluster_1_experts = sum(1 for p in scatter_points if p["cluster"] == 1 and p["true_group"] == "expert")
    cluster_1_total = max(1, sum(1 for p in scatter_points if p["cluster"] == 1))
    purity_1 = round((cluster_1_experts / cluster_1_total) * 100, 1)
    
    summary = {
        "optimal_k": best_k,
        "best_silhouette": round(best_sil, 4),
        "cluster_0_expert_purity": purity_0,
        "cluster_1_expert_purity": purity_1,
        "explained_variance_ratio": [round(float(v), 3) for v in pca.explained_variance_ratio_]
    }
    
    return sweep_results, scatter_points, summary
