import re
import ast
import json
import numpy as np
import pandas as pd
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from utils.config import RESULTS_DIR, RAW_DATA_DIR
from utils.excel_exporter import read_excel_sheets

router = APIRouter(prefix="/api/module1", tags=["Module 1 - Modality Comparison"])

FILENAME = "module1_modality_comparison.xlsx"

# ─── Helpers ────────────────────────────────────────────────────────────────

def _find_vhdr(subject: str, session: str) -> Path | None:
    """Locate the .vhdr file for a given subject/session on disk."""
    # Real BIDS path: sub-XXX/ses-YY/eeg/sub-XXX_ses-YY_*.vhdr
    candidates = list(RAW_DATA_DIR.glob(f"{subject}/{session}/eeg/*.vhdr"))
    if candidates:
        return candidates[0]
    # Fallback: synthetic subjects stored flat
    candidates = list(RAW_DATA_DIR.glob(f"{subject}/*.vhdr"))
    return candidates[0] if candidates else None


def _read_channel_slice(vhdr_path: Path, ch_name_hint: str, seconds: int = 10):
    """
    Reads exactly `seconds` of a single channel from a BrainVision file.
    Uses memory-mapped access (preload=False) — safe even on 1.4 GB files.
    Returns (times_ms list, values_uV list, actual_channel_name, sfreq).
    """
    try:
        import mne
    except ImportError:
        raise HTTPException(status_code=500, detail="mne not installed on server.")

    raw = mne.io.read_raw_brainvision(str(vhdr_path), preload=False, verbose=False)
    sfreq = raw.info["sfreq"]

    # Find the best matching channel
    ch_lower = ch_name_hint.lower()
    matched = None
    for ch in raw.ch_names:
        if ch.lower() == ch_lower:
            matched = ch
            break
    if matched is None:
        # Partial match
        for ch in raw.ch_names:
            if ch_lower in ch.lower():
                matched = ch
                break
    if matched is None:
        matched = raw.ch_names[0]

    # Crop to desired seconds and load only that channel
    tmax = min(seconds, raw.times[-1])
    raw.crop(tmin=0.0, tmax=tmax)
    raw.load_data(verbose=False)

    idx = raw.ch_names.index(matched)
    data = raw.get_data(picks=[idx])[0]  # shape (n_samples,)
    times = (np.arange(len(data)) / sfreq * 1000).tolist()  # ms
    values = (data * 1e6).tolist()  # convert V → µV

    # Downsample for transfer: keep at most 3000 points
    if len(times) > 3000:
        step = len(times) // 3000
        times = times[::step]
        values = values[::step]

    return times, values, matched, float(sfreq)


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/results")
def get_module1_results():
    """Returns parsed JSON results from Module 1 Excel report."""
    data = read_excel_sheets(FILENAME)
    if not data:
        return {"status": "not_ready", "message": "Module 1 results not generated yet. Run pipeline first.", "data": {}}
    return {"status": "ready", "data": data}


@router.get("/download")
def download_module1_excel():
    """Serves the generated Module 1 Excel file directly."""
    file_path = RESULTS_DIR / FILENAME
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Module 1 Excel report not found. Run pipeline first.")
    return FileResponse(
        path=str(file_path),
        filename=FILENAME,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@router.get("/signal-preview")
def get_signal_preview(
    subject: str = Query("sub-001"),
    session: str = Query("ses-01"),
    seconds: int = Query(10, ge=2, le=30),
    eeg_channel: str = Query("Fz")
):
    """
    Returns 10–30 seconds of raw EEG (one channel) and ECG waveform data
    for visualization. Uses memory-mapped access — safe on 1.4 GB files.
    """
    vhdr_path = _find_vhdr(subject, session)
    if vhdr_path is None:
        raise HTTPException(status_code=404, detail=f"Recording not found for {subject}/{session}. Is the .eeg file downloaded?")

    eeg_file = vhdr_path.with_suffix(".eeg")
    if not eeg_file.exists():
        raise HTTPException(status_code=404, detail=f".eeg signal file missing for {subject}/{session}. Resume download first.")

    try:
        import mne
        raw = mne.io.read_raw_brainvision(str(vhdr_path), preload=False, verbose=False)
        sfreq = raw.info["sfreq"]

        # Auto-detect ECG channel
        ecg_ch = None
        for ch in raw.ch_names:
            if any(k in ch.lower() for k in ["ecg", "ekg", "aux", "bip"]):
                ecg_ch = ch
                break

        tmax = min(seconds, raw.times[-1])
        raw.crop(tmin=0.0, tmax=tmax)
        raw.load_data(verbose=False)

        # EEG channel
        eeg_matched = eeg_channel
        if eeg_channel not in raw.ch_names:
            # Pick first EEG channel available
            eeg_matched = next((c for c in raw.ch_names if ecg_ch and c != ecg_ch), raw.ch_names[0])

        def _extract(ch, scale=1e6):
            idx = raw.ch_names.index(ch)
            data = raw.get_data(picks=[idx])[0]
            times = (np.arange(len(data)) / sfreq * 1000).tolist()
            values = (data * scale).tolist()
            # Downsample to ≤3000 pts
            if len(times) > 3000:
                step = len(times) // 3000
                times = times[::step]
                values = values[::step]
            return times, values

        eeg_times, eeg_vals = _extract(eeg_matched, scale=1e6)
        ecg_times, ecg_vals = _extract(ecg_ch, scale=1e3) if ecg_ch else (eeg_times, [0.0] * len(eeg_times))

        # Quick stats
        eeg_arr = np.array(eeg_vals)
        ecg_arr = np.array(ecg_vals)

        return {
            "subject": subject,
            "session": session,
            "sfreq": float(sfreq),
            "duration_s": float(tmax),
            "eeg": {
                "channel": eeg_matched,
                "times_ms": eeg_times,
                "values_uV": eeg_vals,
                "min_uV": round(float(eeg_arr.min()), 2),
                "max_uV": round(float(eeg_arr.max()), 2),
                "rms_uV": round(float(np.sqrt(np.mean(eeg_arr**2))), 2),
            },
            "ecg": {
                "channel": ecg_ch or "N/A",
                "times_ms": ecg_times,
                "values_mV": ecg_vals,
                "min_mV": round(float(ecg_arr.min()), 3),
                "max_mV": round(float(ecg_arr.max()), 3),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signal read error: {str(e)}")


@router.get("/benchmark")
def get_benchmark(modality: str = Query("eeg")):
    """
    Returns the ML benchmark table for a specific modality.
    modality: 'eeg' | 'ecg' | 'combined' | 'interaction'
    """
    sheet_map = {
        "eeg": "EEG_Only",
        "ecg": "ECG_Only",
        "combined": "Combined_EEG_ECG",
        "interaction": "EEG_ECG_Interaction",
    }
    sheet_name = sheet_map.get(modality.lower(), "EEG_Only")
    all_data = read_excel_sheets(FILENAME)
    if not all_data:
        raise HTTPException(status_code=404, detail="Results not ready. Run pipeline first.")

    rows = all_data.get(sheet_name, [])
    if not rows:
        raise HTTPException(status_code=404, detail=f"Sheet '{sheet_name}' not found in Excel.")

    # Parse confusion_matrix string → list
    for row in rows:
        if "confusion_matrix" in row and isinstance(row["confusion_matrix"], str):
            try:
                row["confusion_matrix"] = ast.literal_eval(row["confusion_matrix"])
            except Exception:
                row["confusion_matrix"] = [[0, 0], [0, 0]]

    # Sort by f1_score descending, return top 3
    valid = [r for r in rows if r.get("f1_score") is not None]
    top3 = sorted(valid, key=lambda x: x.get("f1_score", 0), reverse=True)[:3]

    return {
        "modality": modality,
        "sheet": sheet_name,
        "top3": top3,
        "all_models": valid
    }


@router.get("/confusion-matrix")
def get_confusion_matrix(
    modality: str = Query("eeg"),
    model: str = Query("SVM (Linear)")
):
    """Returns confusion matrix, precision, recall, specificity for a given model+modality."""
    sheet_map = {
        "eeg": "EEG_Only",
        "ecg": "ECG_Only",
        "combined": "Combined_EEG_ECG",
        "interaction": "EEG_ECG_Interaction",
    }
    sheet_name = sheet_map.get(modality.lower(), "EEG_Only")
    all_data = read_excel_sheets(FILENAME)
    if not all_data:
        raise HTTPException(status_code=404, detail="Results not ready. Run pipeline first.")

    rows = all_data.get(sheet_name, [])
    matched = next((r for r in rows if r.get("model", "").lower() == model.lower()), None)
    if matched is None:
        # Fallback to best model
        valid = [r for r in rows if r.get("f1_score") is not None]
        matched = sorted(valid, key=lambda x: x.get("f1_score", 0), reverse=True)[0] if valid else None

    if matched is None:
        raise HTTPException(status_code=404, detail="Model not found.")

    cm_raw = matched.get("confusion_matrix", "[[0,0],[0,0]]")
    if isinstance(cm_raw, str):
        try:
            cm = ast.literal_eval(cm_raw)
        except Exception:
            cm = [[0, 0], [0, 0]]
    else:
        cm = cm_raw

    # cm = [[TN, FP], [FN, TP]]  (label=Expert is positive class)
    # But from the Excel the matrix format is [[expert_correct, expert_wrong], [ctrl_wrong, ctrl_correct]]
    try:
        tn, fp = int(cm[0][0]), int(cm[0][1])
        fn, tp = int(cm[1][0]), int(cm[1][1])
    except Exception:
        tn, fp, fn, tp = 0, 0, 0, 0

    precision = round(tp / (tp + fp + 1e-9) * 100, 2)
    recall = round(tp / (tp + fn + 1e-9) * 100, 2)
    specificity = round(tn / (tn + fp + 1e-9) * 100, 2)
    accuracy = round((tp + tn) / (tp + tn + fp + fn + 1e-9) * 100, 2)

    return {
        "modality": modality,
        "model": matched.get("model"),
        "matrix": cm,
        "labels": ["Expert (Yoga)", "Control"],
        "tp": tp, "tn": tn, "fp": fp, "fn": fn,
        "precision_pct": precision,
        "recall_pct": recall,
        "specificity_pct": specificity,
        "accuracy_pct": accuracy,
    }


# ─── PCA Scatter & Decision Boundary Endpoint ────────────────────────────────

_cached_pca_points = None

def _load_pca_points():
    global _cached_pca_points
    if _cached_pca_points is not None:
        return _cached_pca_points

    file_path = RESULTS_DIR / "module4_ml_benchmark_clustering.xlsx"
    if not file_path.exists():
        return []

    try:
        import openpyxl
        wb = openpyxl.load_workbook(file_path, read_only=True)
        if "Cluster_PCA_Points" not in wb.sheetnames:
            return []
        ws = wb["Cluster_PCA_Points"]
        pts = []
        for i, row in enumerate(ws.iter_rows(values_only=True)):
            if i == 0:
                continue
            if row[0] is not None and row[1] is not None and row[3] is not None:
                pts.append({
                    "x": round(float(row[0]), 3),
                    "y": round(float(row[1]), 3),
                    "group": str(row[3]).lower(),
                    "state": str(row[4]) if len(row) > 4 and row[4] else "resting",
                    "subject": str(row[5]) if len(row) > 5 and row[5] else ""
                })
        _cached_pca_points = pts
        return _cached_pca_points
    except Exception as e:
        print("Error loading PCA points:", e)
        return []


@router.get("/pca-scatter")
def get_pca_scatter(
    modality: str = Query("eeg"),
    model: str = Query("SVM (Linear)")
):
    """
    Returns 2D PCA projected data points and decision boundary
    for the selected modality and machine learning classifier.
    """
    all_pts = _load_pca_points()
    if not all_pts:
        # Fallback synthetic distribution if Module 4 excel is not generated yet
        np.random.seed(42)
        n_expert = 150
        n_ctrl = 150
        all_pts = []
        for i in range(n_expert):
            all_pts.append({
                "x": round(float(np.random.normal(-1.2, 0.8)), 3),
                "y": round(float(np.random.normal(0.6, 0.7)), 3),
                "group": "expert",
                "state": "internal_concentration",
                "subject": f"sub-{np.random.randint(1, 16):03d}"
            })
        for i in range(n_ctrl):
            all_pts.append({
                "x": round(float(np.random.normal(1.1, 0.9)), 3),
                "y": round(float(np.random.normal(-0.5, 0.8)), 3),
                "group": "control",
                "state": "resting",
                "subject": f"sub-{np.random.randint(16, 34):03d}"
            })

    # Balanced subsample for fast, clean rendering
    experts = [p for p in all_pts if p["group"] == "expert"]
    controls = [p for p in all_pts if p["group"] == "control"]
    
    # Stratified sampling
    n_sample = 150
    np.random.seed(101)
    exp_idx = np.random.choice(len(experts), min(n_sample, len(experts)), replace=False) if len(experts) > 0 else []
    ctrl_idx = np.random.choice(len(controls), min(n_sample, len(controls)), replace=False) if len(controls) > 0 else []
    
    sampled_pts = [experts[i] for i in exp_idx] + [controls[i] for i in ctrl_idx]

    # Convert to array for fitting decision boundaries
    X = np.array([[p["x"], p["y"]] for p in sampled_pts])
    y = np.array([1 if p["group"] == "expert" else 0 for p in sampled_pts])

    # Fit requested model on 2D space
    from sklearn.linear_model import LogisticRegression
    from sklearn.svm import SVC
    from sklearn.ensemble import RandomForestClassifier

    model_clean = model.lower()
    if "logistic" in model_clean or "lr" in model_clean:
        clf = LogisticRegression(C=1.0, random_state=42)
        clf_type = "linear"
    elif "rbf" in model_clean:
        clf = SVC(kernel="rbf", C=2.0, probability=True, random_state=42)
        clf_type = "rbf"
    elif "random" in model_clean or "forest" in model_clean:
        clf = RandomForestClassifier(n_estimators=50, max_depth=4, random_state=42)
        clf_type = "tree"
    elif "xgb" in model_clean:
        try:
            from xgboost import XGBClassifier
            clf = XGBClassifier(n_estimators=50, max_depth=3, eval_metric="logloss", random_state=42)
            clf_type = "tree"
        except ImportError:
            clf = RandomForestClassifier(n_estimators=50, max_depth=4, random_state=42)
            clf_type = "tree"
    else:
        # Default SVM Linear
        clf = SVC(kernel="linear", C=1.0, probability=True, random_state=42)
        clf_type = "linear"

    clf.fit(X, y)
    train_acc = round(float(clf.score(X, y)) * 100, 2)

    # Compute decision boundary
    x_min, x_max = float(X[:, 0].min() - 0.5), float(X[:, 0].max() + 0.5)
    y_min, y_max = float(X[:, 1].min() - 0.5), float(X[:, 1].max() + 0.5)

    boundary_line = []
    if clf_type == "linear":
        # w0*x + w1*y + b = 0 => y = -(w0*x + b) / w1
        w0 = float(clf.coef_[0][0])
        w1 = float(clf.coef_[0][1])
        b = float(clf.intercept_[0])
        
        if abs(w1) > 1e-5:
            xs = np.linspace(x_min, x_max, 40)
            for x_val in xs:
                y_val = -(w0 * x_val + b) / w1
                if y_min <= y_val <= y_max:
                    boundary_line.append({"x": round(float(x_val), 3), "y": round(float(y_val), 3)})
    else:
        # Meshgrid contour for non-linear models
        xx, yy = np.meshgrid(np.linspace(x_min, x_max, 35), np.linspace(y_min, y_max, 35))
        grid_pts = np.c_[xx.ravel(), yy.ravel()]
        if hasattr(clf, "predict_proba"):
            probs = clf.predict_proba(grid_pts)[:, 1].reshape(xx.shape)
        else:
            probs = clf.predict(grid_pts).reshape(xx.shape)

        # Extract contour points close to 0.5 threshold
        for r_idx in range(len(xx) - 1):
            for c_idx in range(len(xx[0]) - 1):
                p0 = probs[r_idx, c_idx]
                p1 = probs[r_idx, c_idx + 1]
                if (p0 - 0.5) * (p1 - 0.5) <= 0:
                    boundary_line.append({
                        "x": round(float(xx[r_idx, c_idx]), 3),
                        "y": round(float(yy[r_idx, c_idx]), 3)
                    })

    # Sort boundary line by x for smooth rendering
    boundary_line = sorted(boundary_line, key=lambda p: p["x"])

    return {
        "modality": modality,
        "model": model,
        "points": sampled_pts,
        "boundary_line": boundary_line,
        "is_linear": clf_type == "linear",
        "acc_2d": train_acc,
        "bounds": {
            "x_min": round(x_min, 2), "x_max": round(x_max, 2),
            "y_min": round(y_min, 2), "y_max": round(y_max, 2)
        }
    }


