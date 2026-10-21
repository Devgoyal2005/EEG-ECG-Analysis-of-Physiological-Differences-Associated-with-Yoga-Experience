import os
from pathlib import Path

from dotenv import load_dotenv

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = BACKEND_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
RESULTS_DIR = DATA_DIR / "results"
FIGURES_DIR = DATA_DIR / "figures"

# Load environment variables
load_dotenv(BACKEND_DIR / ".env")
HF_TOKEN = os.getenv("HF_TOKEN", "")

# Dataset details
HF_DATASET_REPO = "alexeykashevnik/EEGMeditation"

# Sampling Rates & Signal Filtering Defaults
EEG_LOW_FREQ = 1.0     # Hz (removes DC drift)
EEG_HIGH_FREQ = 40.0   # Hz (removes high-frequency EMG noise)
NOTCH_FREQ = 50.0      # Hz (powerline interference)

# Cognitive States / Event Marker mapping
COGNITIVE_STATES = {
    "resting": "Resting State",
    "internal_concentration": "Internal Concentration",
    "external_concentration": "External Concentration",
    "mind_wandering": "Mind-Wandering"
}

# Frequency Bands (Hz)
FREQ_BANDS = {
    "delta": (0.5, 4.0),
    "theta": (4.0, 8.0),
    "alpha": (8.0, 13.0),
    "beta": (13.0, 30.0),
    "gamma": (30.0, 45.0)
}
