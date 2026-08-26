from typing import List, Dict, Any

def run_yolo_gate(image_path: str) -> bool:
    """Gate check: return True if YOLO detects objects in the frame."""
    try:
        from ultralytics import YOLO
        # Optional YOLO gate (lazy-loaded if installed)
        model = YOLO("yolov8n.pt")
        results = model(image_path, verbose=False)
        return len(results[0].boxes) > 0
    except Exception:
        # If YOLO is not installed or errors, pass through to VLM
        return True

def run_easyocr_gate(image_path: str) -> bool:
    """Gate check: return True if EasyOCR detects on-screen text."""
    try:
        import easyocr
        reader = easyocr.Reader(["en"], verbose=False)
        results = reader.readtext(image_path)
        return len(results) > 0
    except Exception:
        # If EasyOCR is not installed, pass through
        return True
