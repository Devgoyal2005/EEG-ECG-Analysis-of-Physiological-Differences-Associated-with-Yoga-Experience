@echo off
echo ========================================================
echo Starting FastAPI Backend (EEG-ECG Yoga Analysis Platform)
echo ========================================================
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
