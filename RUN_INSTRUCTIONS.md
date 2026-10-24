# How to Run Backend & Frontend

This document provides the terminal commands to start the backend API server and the frontend dashboard.

---

## 1. Start the Backend Server (FastAPI + Uvicorn)

Open a terminal or PowerShell in the root directory:

```powershell
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

* **API Base URL:** `http://localhost:8000`
* **Swagger Interactive API Documentation:** `http://localhost:8000/docs`
* **Health / Status Endpoint:** `http://localhost:8000/api/pipeline/status`

---

## 2. Start the Frontend Dashboard (React + Vite)

Open a second terminal or PowerShell in the root directory:

```powershell
cd frontend
npm run dev
```

* **Frontend Dashboard URL:** `http://localhost:5173`
* **Dataset Explorer:** `http://localhost:5173/dataset`
* **Excel Sheet Viewer:** `http://localhost:5173/excel`

---

## 3. Resume Dataset Download (Hugging Face)

If you need to finish downloading any remaining files from the terminal:

```powershell
python -c "from backend.pipeline.data_loader import download_dataset; download_dataset()"
```
*(Or click **"Download / Resume HF"** on the Dataset & Files page in the browser).*
