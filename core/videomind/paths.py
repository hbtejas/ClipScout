import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent

def get_data_dir() -> Path:
    data_dir = os.getenv("VIDEOMIND_DATA_DIR")
    if data_dir:
        p = Path(data_dir)
    else:
        p = BASE_DIR / "data"
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_cache_dir() -> Path:
    cache_dir = os.getenv("VIDEOMIND_CACHE")
    if cache_dir:
        p = Path(cache_dir)
        if not p.is_absolute():
            p = BASE_DIR / p
    else:
        p = get_data_dir() / "cache"
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_chunks_dir() -> Path:
    p = get_data_dir() / "chunks"
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_analysis_dir() -> Path:
    p = get_data_dir() / "analysis"
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_aggregates_dir() -> Path:
    p = get_data_dir() / "aggregates"
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_qdrant_path() -> Path:
    qdrant_path = os.getenv("QDRANT_PATH")
    if qdrant_path:
        p = Path(qdrant_path)
        if not p.is_absolute():
            p = BASE_DIR / p
    else:
        p = get_data_dir() / "qdrant"
    p.mkdir(parents=True, exist_ok=True)
    return p
