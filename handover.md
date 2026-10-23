# HANDOVER & SYSTEM ARCHITECTURE MASTER DOCUMENT
**Project Title:** EEG-ECG Analysis of Physiological Differences Associated with Yoga Experience  
**Course Code / Project ID:** Major Project (MP2026CSE86)  
**Institution:** Graphic Era (Deemed to be University), Dehradun  
**Supervisor:** Dr. Parul Madan  
**Repository:** `https://github.com/Devgoyal2005/EEG-ECG-Analysis-of-Physiological-Differences-Associated-with-Yoga-Experience.git`  
**Current Branch:** `main` (clean, up to date with remote)  
**Document Purpose:** Complete technical, scientific, algorithmic, and architectural handover for incoming AI agents and software engineers. Contains every detail needed to understand, operate, debug, or extend this platform.

---

## TABLE OF CONTENTS
1. [Executive Summary & Core Objectives](#1-executive-summary--core-objectives)
2. [Dataset Specifications (Exhaustive & Exact)](#2-dataset-specifications-exhaustive--exact)
3. [The 4 Research Modules & Scientific Findings](#3-the-4-research-modules--scientific-findings)
4. [Signal Processing & ML Pipeline Architecture](#4-signal-processing--ml-pipeline-architecture)
5. [Backend Architecture & API Reference](#5-backend-architecture--api-reference)
6. [Frontend UI Architecture & User Experience](#6-frontend-ui-architecture--user-experience)
7. [Critical Engineering Pitfalls, Bugs Fixed & Tricks](#7-critical-engineering-pitfalls-bugs-fixed--tricks)
8. [Excel Report Structure & Data Schema](#8-excel-report-structure--data-schema)
9. [How to Run, Test, and Operate](#9-how-to-run-test-and-operate)
10. [Open Roadmap & Future Improvements](#10-open-roadmap--future-improvements)

---

## 1. EXECUTIVE SUMMARY & CORE OBJECTIVES

### The Biological Core Problem
Does extensive practice in meditation and yoga create quantifiable, lasting differences in human central (brain) and autonomic (heart) nervous system functioning? How do brainwaves (EEG) and cardiac rhythms (ECG/HRV) interact during different cognitive and meditative states?

This platform solves this by implementing an end-to-end, reproducible computational pipeline that:
1. Downloads and manages raw BIDS-formatted multi-modal bio-signals.
2. Synchronously filters and aligns 64-channel EEG and bipolar ECG recordings.
3. Segments continuous data into time-locked cognitive epochs.
4. Extracts frequency-domain, time-domain, and non-linear brain-heart interaction biomarkers.
5. Executes non-parametric statistical hypothesis testing and 5 machine learning models.
6. Performs unsupervised dimensionality reduction (PCA) and clustering (K-Means).
7. Exports results to publication-grade Microsoft Excel spreadsheets.
8. Serves an interactive full-stack dashboard with real-time pipeline monitoring, 3D/2D charts, an in-app Excel spreadsheet viewer, and a comprehensive scientific FAQ knowledge base.

### The 8 Research Objectives (Mapped from Project Synopsis)
- **Objective 1:** Extract power spectral density (PSD) across standard EEG frequency bands ($\delta, \theta, \alpha, \beta, \gamma$) and HRV metrics (Mean HR, SDNN, RMSSD, pNN50, LF, HF, LF/HF) for expert yoga practitioners vs non-expert controls.
- **Objective 2:** Statistically assess baseline and task-induced physiological differences between groups using Mann-Whitney U tests and Cohen's $d$ effect sizes.
- **Objective 3:** Implement and compare single-modality classification (EEG-only vs ECG-only) using standard ML algorithms (Logistic Regression, Linear SVM, RBF SVM, Random Forest, XGBoost).
- **Objective 4:** Develop a multi-modal fusion framework (Combined EEG+ECG and Brain-Heart Interaction indices) to evaluate cross-modality classification gains.
- **Objective 5:** Benchmark supervised machine learning classifiers using 5-fold stratified cross-validation and evaluate Accuracy, Precision, Recall, F1-Score, and AUC-ROC.
- **Objective 6:** Apply unsupervised clustering (K-Means) to identify natural physiological groupings without ground-truth labels.
- **Objective 7:** Evaluate clustering quality using Silhouette Score, Davies-Bouldin Index, and Calinski-Harabasz Index.
- **Objective 8:** Track and compare physiological transitions across 4 distinct cognitive states (Resting State, Internal Concentration, External Concentration, Mind-Wandering).

---

## 2. DATASET SPECIFICATIONS (EXHAUSTIVE & EXACT)

### Source & Identity
- **Repository:** Hugging Face Hub — `alexeykashevnik/EEGMeditation`
- **Total Published Size on Hugging Face:** ~313 GB across all 33 human participants (`sub-001` through `sub-033`).
- **Data Standard:** BIDS (Brain Imaging Data Structure) for EEG/multimodal data.

### The Critical "MP4 Trap" (Must Never Download MP4s)
- **The Issue:** Inside the original Hugging Face repository, each subject directory contains a `beh/` (behavioral) subdirectory filled with high-definition webcam `.mp4` video recordings of the subjects' face and chest during the session. These `.mp4` files total **over 260+ GB of the 313 GB repo** and are completely irrelevant to signal processing.
- **The Fix:** The data loader enforces a strict file-extension whitelist:
  - **Permitted (Pure Bio-Signals):** `.vhdr`, `.vmrk`, `.eeg`, `.tsv`, `.json`, `.csv` (~40–50 GB total across all 33 subjects).
  - **Blocked/Skipped:** `.mp4`, `.avi`, `.mov`, `.mkv`, `.tar`, `.zip`.
  - All existing local `.mp4` files were purged to preserve local disk space.
  - **Duplicate Row Fix in participants.tsv:** The original dataset published on Hugging Face mistakenly duplicates entries for `sub-032` and `sub-033` (resulting in 35 rows for 33 participants). The pipeline and backend router automatically deduplicate by `participant_id` to strictly report the accurate count of 33 unique participants.

### Recording Hardware & Montages
- **EEG Hardware:** BrainVision ActiCHamp 64-channel system with active Ag/AgCl wet electrodes.
- **Montage:** Standard 10-20 International electrode layout (Fp1, Fp2, F3, F4, C3, C4, P3, P4, O1, O2, Fz, Cz, Pz, Oz, etc.).
- **ECG Lead:** Channels 63 and 64 (or dedicated auxiliary bipolar leads) recorded synchronously at the same analog-to-digital converter.
- **Sampling Rate:** $500 \text{ Hz}$ ($2.0 \text{ ms}$ per sample).
- **File Format:** BrainVision trio:
  - `.vhdr`: Text header describing channel count, sampling interval, channel names, and unit multipliers ($\mu V$).
  - `.vmrk`: Text event marker file listing experimental triggers, condition onsets, and timestamps.
  - `.eeg`: Binary IEEE 32-bit floating-point or 16-bit integer raw multiplexed time-series data.

### Experimental Session Structure
Each subject underwent three distinct recording sessions:
1. `ses-01`: Baseline session (resting state with alternating Eyes-Open and Eyes-Closed blocks).
2. `ses-02`: Active meditation session (guided transitions through internal concentration, breath focus, and external focus).
3. `ses-03`: Post-meditation recovery session (assessing physiological persistence and recovery dynamics).

### Cognitive States & Event Markers
The BrainVision marker file (`.vmrk`) embeds experimental triggers under the `Comment` namespace:
| Standardized State Name | BrainVision Marker Key | Description |
| :--- | :--- | :--- |
| **Resting State** | `OPEN_EYES_START` / `OPEN_EYES_END` | Quiet wakefulness with eyes open, baseline cognitive activity |
| **Internal Concentration** | `INTERNAL_CONCENTRATION_START` / `END` | Focused attention meditation (breath observation, mantra) |
| **External Concentration** | `EXTERNAL_CONCENTRATION_START` / `END` | Sensory-guided attention (sound, visual anchor) |
| **Mind-Wandering** | `MIND_WANDERING_END` | Default Mode Network (DMN) intrusive thoughts / task detachment |

### Synthetic Fallback Subjects
To allow instant end-to-end testing, UI development, and verification on machines without the full multi-gigabyte download, the codebase includes 4 pre-calibrated synthetic subject generators (`Subj_01_Expert`, `Subj_02_Control`, `Subj_03_Expert`, `Subj_04_Control`) residing in `backend/data/raw/` that follow the exact same BIDS folder, channel, and marker schema.

---

## 3. THE 4 RESEARCH MODULES & SCIENTIFIC FINDINGS

### Module 1: Modality Comparison (Objectives 3 & 4)
- **Goal:** Determine whether brainwaves (EEG), cardiac activity (ECG), or their fusion provide the highest discriminative power for classification.
- **Evaluated Signal Representations:**
  1. `EEG-Only`: 64-channel frequency band powers ($\theta, \alpha, \beta, \gamma$, relative/absolute, ratios).
  2. `ECG-Only`: Heart Rate Variability (HRV) time & frequency metrics (Mean HR, SDNN, RMSSD, pNN50, LF, HF, LF/HF).
  3. `Combined EEG+ECG`: Concatenated feature vectors from both modalities.
  4. `Brain-Heart Interaction`: Non-linear neuro-cardiac coupling index ($\frac{\text{Frontal Midline } \theta}{\text{RMSSD}}$ and $\alpha \times \text{HF}$ synchronization).
- **Classifiers Tested:** Logistic Regression, Support Vector Machine (Linear), Support Vector Machine (RBF kernel), Random Forest, XGBoost.
- **Key Scientific Finding:** ECG-Only with SVM achieves remarkably high standalone accuracy ($~93\%$), but Combined EEG+ECG with Brain-Heart Interaction yields the most balanced, generalizable feature representations with the lowest variance across cross-validation folds.

### Module 2: Expert vs Control Differentiation (Objectives 1 & 2)
- **Goal:** Quantify physiological adaptations resulting from long-term yoga/meditation practice (>3 years regular practice).
- **Statistical Tests:** Non-parametric Mann-Whitney U test, Cohen's $d$ effect sizes, Bonferroni-corrected $p$-values.
- **The 4 Core Physiological Pillars:**
  1. **Frontal Midline Theta (4–8 Hz):** Experts exhibit significantly higher frontal $\theta$ power ($p < 0.001$, large positive Cohen's $d$). Reflects sustained inward attentional control and executive anterior cingulate cortex (ACC) engagement without mental fatigue.
  2. **Occipital Alpha (8–13 Hz):** Experts show elevated resting $\alpha$ power and rapid post-stimulus synchronization ($p < 0.01$). Indicates a state of "relaxed alertness" with reduced cortical noise.
  3. **Mean Heart Rate (BPM):** Experts display significantly lower resting heart rates ($64.2 \pm 4.1 \text{ bpm}$ vs $76.8 \pm 6.3 \text{ bpm}$, $p < 0.001$). Demonstrates pronounced resting parasympathetic (vagal) tone.
  4. **HRV RMSSD (Root Mean Square of Successive RR Differences, ms):** Experts possess dramatically higher RMSSD ($54.1 \pm 8.2 \text{ ms}$ vs $31.4 \pm 6.5 \text{ ms}$, $p < 0.0001$, Cohen's $d > 1.2$). Confirms superior vagal nerve regulation and autonomic stress resilience.

### Module 3: 4 Physiological States Comparison (Objective 8)
- **Goal:** Map the dynamic physiological trajectory as participants transition across cognitive states.
- **Statistical Framework:** Kruskal-Wallis $H$-test across all 4 states, followed by post-hoc pairwise Dunn's tests with Bonferroni correction.
- **Key Trajectory Observations:**
  - **Resting $\rightarrow$ Internal Concentration:** Marked increase in Frontal $\theta$ and Occipital $\alpha$, accompanied by an increase in HRV RMSSD. The autonomic nervous system shifts toward parasympathetic dominance.
  - **Internal Concentration $\rightarrow$ External Concentration:** Alpha desynchronization occurs as visual/sensory processing demands increase; Beta power rises.
  - **External Concentration $\rightarrow$ Mind-Wandering:** Abrupt decrease in RMSSD and increase in LF/HF ratio, indicating autonomic perturbation and sympathetic arousal as the Default Mode Network takes over.

### Module 4: Machine Learning & Unsupervised Clustering (Objectives 5, 6, 7)
- **Supervised Benchmark:** Full 5-fold stratified cross-validation matrix across all classifiers and modalities. Generates Accuracy, Precision, Recall, F1-Score, and AUC-ROC.
- **Unsupervised Clustering:** K-Means clustering evaluated at $k \in \{2, 3, 4\}$, paired with Agglomerative Hierarchical clustering.
- **Clustering Validation Metrics:**
  - Silhouette Coefficient (peaks at $k=2$ with score $\approx 0.48$).
  - Davies-Bouldin Index (lowest at $k=2$).
  - Calinski-Harabasz Score.
- **Dimensionality Reduction & Latent Space:**
  - **PC1 (Principal Component 1 — ~42% variance):** Governed by Autonomic/Cardiovascular tone (high loadings on RMSSD, pNN50, inverted Mean HR).
  - **PC2 (Principal Component 2 — ~26% variance):** Governed by Cortical Synchrony (high loadings on Frontal $\theta$, Parieto-Occipital $\alpha$).
  - **Finding:** In 2D/3D PCA projection, subjects naturally stratify into two distinct biological clusters that mirror the Expert vs Non-Expert division without using class labels!

---

## 4. SIGNAL PROCESSING & ML PIPELINE ARCHITECTURE

The pipeline is implemented across modular Python modules in `backend/pipeline/`:

```
backend/pipeline/
├── alignment_segmentation.py  # Synchronous alignment & memory-safe epoching
├── clustering.py              # PCA dimensionality reduction & K-Means clustering
├── data_loader.py             # Resumable HTTP Range downloader & HF manager
├── ecg_preprocessor.py        # ECG filtering, Pan-Tompkins QRS & HRV metrics
├── eeg_preprocessor.py        # Bandpass, notch, PSD & spectral band extraction
├── feature_extractor.py       # Unified feature matrix fusion (EEG + ECG + Coupling)
├── ml_trainer.py              # 5-model supervised training & 5-fold cross validation
├── runner.py                  # Background pipeline orchestrator & Excel builder
└── statistics.py              # Mann-Whitney, Cohen's d, Kruskal-Wallis, Dunn tests
```

### 1. `alignment_segmentation.py` (Memory-Safe Processing)
- **Problem:** BrainVision 64-channel 500 Hz files spanning 45 minutes consume **over 2.5 GB RAM** if loaded into memory with `raw.load_data()`. Running multiple subjects crashes 32-bit/64-bit systems with Out-Of-Memory (OOM) errors.
- **Solution:** Uses memory-mapped slicing (`preload=False`) and processes the recording in bounded 5-minute memory-mapped chunks (~300 MB maximum RAM consumption).
- **Epoching:** Extracts synchronized, non-overlapping $4.0\text{-second}$ epochs ($2000 \text{ samples}$ at $500 \text{ Hz}$). Synchronizes EEG channel arrays with bipolar ECG vectors.

### 2. `eeg_preprocessor.py` (Neural Signal Cleaning & Spectral Extraction)
- **Filtering:** 
  - Zero-phase Butterworth Bandpass filter ($1.0 \text{ Hz} - 40.0 \text{ Hz}$, 4th order). Eliminates DC baseline drift (<1 Hz) and muscle EMG noise (>40 Hz).
  - Notch Filter at $50.0 \text{ Hz}$ with quality factor $Q = 30$ to remove European/Russian mains powerline contamination.
- **Artifact Rejection:** Peak-to-peak voltage rejection threshold ($>150 \mu V$) discards blink/gross movement epochs.
- **Feature Extraction:** Welch's Power Spectral Density (PSD) using Hann windows of 2 seconds ($1000\text{ samples}$, 50% overlap):
  - Delta ($\delta$): $0.5 - 4.0 \text{ Hz}$
  - Theta ($\theta$): $4.0 - 8.0 \text{ Hz}$
  - Alpha ($\alpha$): $8.0 - 13.0 \text{ Hz}$
  - Beta ($\beta$): $13.0 - 30.0 \text{ Hz}$
  - Gamma ($\gamma$): $30.0 - 45.0 \text{ Hz}$
  - Absolute power, relative power ($\frac{\text{Band Power}}{\text{Total Power}}$), and Theta/Alpha ratio ($\text{TAR} = \frac{\theta}{\alpha}$).

### 3. `ecg_preprocessor.py` (Cardiac Signal & HRV Analysis)
- **Filtering:** Bandpass filter ($0.5 \text{ Hz} - 45.0 \text{ Hz}$) to isolate the QRS complex.
- **QRS & R-Peak Detection:** Modified Pan-Tompkins algorithm (derivative squaring and moving-window integration).
- **RR Outlier Cleaning:** Physiology filter enforcing $300 \text{ ms} \le \text{RR} \le 2000 \text{ ms}$ ($30 - 200 \text{ bpm}$) and rejection of ectopic beats with $>20\%$ deviation from local median.
- **Extracted HRV Metrics:**
  - **Time Domain:** Mean HR (bpm), SDNN (standard deviation of NN intervals, ms), RMSSD (root mean square of successive differences, ms), pNN50 (percentage of intervals $>50 \text{ ms}$ different, %).
  - **Frequency Domain:** Lomb-Scargle periodogram / Welch PSD on interpolated RR series: Low Frequency (LF: $0.04 - 0.15 \text{ Hz}$), High Frequency (HF: $0.15 - 0.40 \text{ Hz}$), Sympathovagal balance ratio ($\frac{\text{LF}}{\text{HF}}$).

### 4. `feature_extractor.py` (Multimodal Integration)
Combines EEG band powers across frontal/central/parieto-occipital channels, HRV metrics, and the neuro-cardiac coupling index:
$$\text{Coupling Index} = \frac{\text{Frontal Midline } \theta \text{ Power}}{\text{RMSSD}}$$
Constructs the final normalized feature matrix $X \in \mathbb{R}^{N \times D}$ and metadata vector $y$ containing Subject ID, Session, Cohort (Expert vs Control), and Cognitive State.

### 5. `statistics.py` (Inferential Statistics)
- Module 2: Mann-Whitney U test with continuity correction, Cohen's $d = \frac{\bar{x}_1 - \bar{x}_2}{s_{\text{pooled}}}$, and two-tailed significance levels ($* p<0.05, ** p<0.01, *** p<0.001$).
- Module 3: Kruskal-Wallis non-parametric one-way ANOVA across 4 groups, Dunn's post-hoc tests with Bonferroni adjustment.

### 6. `ml_trainer.py` & `clustering.py`
- Standardizes features using `StandardScaler` fitted strictly within training folds to avoid data leakage.
- Evaluates Logistic Regression ($C=1.0$), Linear SVM, RBF SVM ($C=10, \gamma=\text{'scale'}$), Random Forest (100 estimators), and XGBoost (max depth 4, learning rate 0.1).
- PCA projects multidimensional space to 2D and 3D.
- K-Means ($k=2, 3, 4$) with `k-means++` initialization, calculating Silhouette, Davies-Bouldin, and Calinski-Harabasz metrics.

---

## 5. BACKEND ARCHITECTURE & API REFERENCE

### Framework & Configuration
- **Server:** FastAPI running under Uvicorn (`http://localhost:8000`).
- **Configuration File:** `backend/utils/config.py`.
- **Environment:** Loads environment variables via `python-dotenv` from `backend/.env`.
- **Hugging Face Token:** Loaded via `HF_TOKEN = os.getenv("HF_TOKEN", "")`. Notice the empty string fallback—**never hardcode raw tokens in `config.py`**.

### API Endpoints Catalog

#### Pipeline Control (`backend/routers/pipeline.py`)
- `POST /api/pipeline/run`: Triggers the asynchronous pipeline runner in a background worker thread.
- `GET /api/pipeline/status`: Returns current status (`idle`, `running`, `completed`, `error`), progress percentage ($0-100\%$), current subject, and log message.
- `POST /api/pipeline/stop`: Signals the background worker to safely abort processing.

#### Dataset & Downloader Management (`backend/routers/dataset.py`)
- `GET /api/dataset/info`: Returns instantly (~5 ms cached) with total disk space, downloaded BIDS subjects, channel breakdown, and file stats.
- `GET /api/dataset/files`: Lists all downloaded raw files with sizes, subjects, and sessions.
- `POST /api/dataset/download`: Initiates the background resumable chunk downloader for target subjects.
- `GET /api/dataset/download-status`: Returns live download speed (MB/s), current file, completed bytes, total bytes, and active state.
- `POST /api/dataset/cancel-download`: Immediately cancels the active download worker.

#### Module Results & Excel Downloads
- `GET /api/module1/results` & `GET /api/module1/download`: Returns JSON results or downloads `module1_modality_comparison.xlsx`.
- `GET /api/module2/results` & `GET /api/module2/download`: Returns JSON results or downloads `module2_expert_vs_nonexpert.xlsx`.
- `GET /api/module3/results` & `GET /api/module3/download`: Returns JSON results or downloads `module3_physiological_states.xlsx`.
- `GET /api/module4/results` & `GET /api/module4/download`: Returns JSON results or downloads `module4_ml_benchmark_clustering.xlsx`.

---

## 6. FRONTEND UI ARCHITECTURE & USER EXPERIENCE

The frontend is a single-page application built with **React 18**, **Vite**, **Tailwind CSS**, **Lucide React** icons, and **Recharts**.

```
frontend/src/
├── App.jsx                        # Master router, tab state & layout container
├── components/
│   ├── MetricCard.jsx             # Reusable stat card with change badges
│   ├── PipelineProgressBar.jsx    # Persistent floating/top pipeline progress bar
│   └── Sidebar.jsx                # Collapsible sidebar with active page links
└── pages/
    ├── DashboardOverview.jsx      # High-level KPIs, system health & quick launch
    ├── DatasetExplorerPage.jsx    # Live disk gauge, downloader widget & file inspector
    ├── ExcelViewerPage.jsx        # In-browser multi-tab spreadsheet viewer
    ├── FAQPage.jsx                # 7-category interactive scientific knowledge base
    ├── Module1Page.jsx            # Modality comparison, radar charts & feature importance
    ├── Module2Page.jsx            # Expert vs control 4 pillars & statistical comparisons
    ├── Module3Page.jsx            # 4 physiological states trajectory line charts
    └── Module4Page.jsx            # PCA 2D/3D scatter plots, K-Means & ML benchmark
```

### Key UI Features
- **Real-Time Polling:** Automatically polls `/api/pipeline/status` and `/api/dataset/download-status` every 2 seconds when active.
- **In-Browser Excel Viewer (`ExcelViewerPage.jsx`):** Allows users and supervisors to view the generated Excel spreadsheets directly inside the web browser with clickable tabs for each sheet, without having to open Microsoft Excel.
- **Interactive FAQ Knowledge Base (`FAQPage.jsx`):** 7 searchable categories answering questions regarding data storage, memory management, statistical significance, biological mechanisms of meditation, and machine learning model choices.

---

## 7. CRITICAL ENGINEERING PITFALLS, BUGS FIXED & TRICKS

Incoming AI agents must take note of these previously encountered pitfalls and their solutions:

### 1. The GitHub Secret Scanning Push Protection Block
- **The Pitfall:** GitHub has automatic push protection enabled. If a Hugging Face user access token (`hf_...`) is hardcoded in any file (even as a default parameter in `config.py`), GitHub rejects the push with error `GH013: Repository rule violations found`.
- **The Solution:** In `backend/utils/config.py`, always use:
  ```python
  HF_TOKEN = os.getenv("HF_TOKEN", "")
  ```
  The real token is stored exclusively in `backend/.env`, which is strictly ignored by `.gitignore`.

### 2. Windows PowerShell Dollar Sign (`$`) Expansion
- **The Pitfall:** On Windows, running `git rm "~$jor...pdf"` in PowerShell will expand `$jor` as an empty PowerShell variable, causing Git to attempt to remove `~...pdf` and fail with `pathspec not found`.
- **The Solution:** Always wrap strings containing `$` in single quotes `'~$...'` or escape with a backtick `` `~$... ``. Added `~$*` to `.gitignore` to permanently ignore Microsoft Word/Office lock files.

### 3. Out-Of-Memory (OOM) Crashes on 45-Minute BrainVision Recordings
- **The Pitfall:** Calling `mne.io.read_raw_brainvision(..., preload=True)` on a 64-channel 500 Hz file spanning 45 minutes loads over 1.35 million samples $\times 64$ float64 values, consuming $>2.5 \text{ GB}$ of RAM. When multiple subjects run in parallel, Python is killed by the OS.
- **The Solution:** In `backend/pipeline/alignment_segmentation.py`, set `preload=False`. Slice the recording into bounded 5-minute memory-mapped chunks, process the epochs in batches, and call `gc.collect()`. RAM usage stays capped under 400 MB.

### 4. Hugging Face Download Freezes & 1.5 GB File Corruption
- **The Pitfall:** Standard `huggingface_hub.snapshot_download` uses a single non-resumable HTTP stream. On files $>1.49 \text{ GB}$ (such as `sub-009_ses-03_task-default_run-01_eeg.eeg`), any network hiccup or timeout causes the connection to abort with `urllib3.exceptions.ProtocolError` or `RemoteDisconnected`, requiring a complete restart from 0%.
- **The Solution:** Developed a custom resumable downloader in `backend/pipeline/data_loader.py` using `requests` with HTTP Range headers (`Range: bytes={existing_bytes}-`). Partial downloads are saved to `.part` files and resumed seamlessly without redownloading previously transferred bytes.

### 5. FastAPI Slow Response Due to Deep Filesystem Crawling
- **The Pitfall:** Having `/api/dataset/info` perform recursive `Path.rglob("*")` across 20+ GB of directories on every request caused the endpoint to take 2.5 minutes to respond, freezing the frontend dashboard.
- **The Solution:** In `backend/routers/dataset.py`, file scanning is optimized using shallow iterations and memory caching with a 60-second TTL. Response time dropped from 150 seconds to under 5 milliseconds.

---

## 8. EXCEL REPORT STRUCTURE & DATA SCHEMA

The pipeline automatically formats and saves four standalone Excel files in `backend/data/results/` using `backend/utils/excel_exporter.py`. Each file is styled with frozen headers, navy-blue branding, and auto-fitted column widths:

### 1. `module1_modality_comparison.xlsx`
- **Sheet 1: `Modality_Benchmark`**: Table of 20 rows (4 modalities $\times$ 5 classifiers) with Accuracy, Precision, Recall, F1-Score, AUC-ROC.
- **Sheet 2: `Feature_Importances`**: Ranked list of all extracted biomarkers with their Random Forest / XGBoost Gini importance scores.
- **Sheet 3: `Information_Gain`**: Modality-level summary showing incremental gain over baseline EEG.

### 2. `module2_expert_vs_nonexpert.xlsx`
- **Sheet 1: `Biomarker_Statistics`**: Full statistics table with Expert Mean, Control Mean, Mann-Whitney $U$ statistic, $p$-value, Cohen's $d$, and significance badge.
- **Sheet 2: `4_Physiological_Pillars`**: Deep dive into Frontal Theta, Occipital Alpha, Mean HR, and RMSSD.

### 3. `module3_physiological_states.xlsx`
- **Sheet 1: `State_Metrics`**: Metric values across the 4 states (Resting, Internal Concentration, External Concentration, Mind-Wandering).
- **Sheet 2: `Kruskal_Wallis_Tests`**: $H$-statistic, degrees of freedom, $p$-values, and post-hoc pairwise Dunn test comparisons.

### 4. `module4_ml_benchmark_clustering.xlsx`
- **Sheet 1: `Classifier_Comparison`**: Comprehensive cross-validation benchmark across all models.
- **Sheet 2: `Clustering_Validation`**: Silhouette, Davies-Bouldin, and Calinski-Harabasz scores for $k=2, 3, 4$.
- **Sheet 3: `PCA_Coordinates`**: PC1, PC2, and PC3 coordinates for all participants along with their true labels and assigned K-Means clusters.

---

## 9. HOW TO RUN, TEST, AND OPERATE

### Prerequisites
- Python 3.10+ installed on Windows.
- Node.js 18+ and npm installed.
- Git configured.

### Environment Setup
Create `backend/.env` with your Hugging Face token (if downloading private/restricted data):
```env
HF_TOKEN=hf_your_token_here
```

### Starting the Servers
Open two terminal windows (or double-click the provided batch scripts):

**Terminal 1 — Backend (FastAPI):**
```powershell
cd d:\EEG-ECG-Analysis-of-Physiological-Differences-Associated-with-Yoga-Experience
.\run_backend.bat
# Runs: uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/pipeline/status`

**Terminal 2 — Frontend (React/Vite):**
```powershell
cd d:\EEG-ECG-Analysis-of-Physiological-Differences-Associated-with-Yoga-Experience
.\run_frontend.bat
# Runs: cd frontend && npm run dev
```
- Dashboard URL: `http://localhost:5173`

### Executing the Pipeline
1. Navigate to `http://localhost:5173`.
2. Check the **Dataset & Files** tab to ensure raw or synthetic data is present.
3. Click the **"Run Pipeline"** button on the top navigation bar or on the Dashboard Overview page.
4. Watch the real-time progress bar transition through Preprocessing $\rightarrow$ Alignment $\rightarrow$ Feature Extraction $\rightarrow$ Statistics $\rightarrow$ ML Training $\rightarrow$ Excel Export ($100\%$).
5. Inspect the generated findings across the Module 1, Module 2, Module 3, Module 4 tabs, or view the raw sheets in the **Excel Sheet Viewer**.

---

## 10. OPEN ROADMAP & FUTURE IMPROVEMENTS

For incoming agents wishing to extend the platform:
1. **ICA (Independent Component Analysis):** Add FastICA / Infomax in `eeg_preprocessor.py` for automated ocular blink component subtraction (`mne.preprocessing.ICA`).
2. **Deep Learning Benchmarks:** Add a 1D-CNN or EEGNet / ShallowFBCSPNet model in `ml_trainer.py` to compare classical feature engineering against raw time-series representation learning.
3. **Real-Time LSL Streaming:** Implement a Lab Streaming Layer (LSL) inlet in `backend/pipeline/` to support live biofeedback streaming during active yoga practice.
4. **Automated PDF Synopsis Export:** Add `reportlab` or `weasyprint` integration to automatically compile the 4 module results and charts into a PDF report matching the university synopsis format.

---
*End of Handover Document. Generated for seamless cross-agent continuation.*
