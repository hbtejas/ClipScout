from typing import Dict, List, Any
from videomind.analyzers.base import Analyzer
from videomind.analyzers.transcript import TranscriptAnalyzer
from videomind.analyzers.default_video import DefaultVideoAnalyzer
from videomind.analyzers.people import PeopleAnalyzer
from videomind.analyzers.object_detection import ObjectDetectionAnalyzer
from videomind.analyzers.ocr import OCRAnalyzer
from videomind.analyzers.diarization import DiarizationAnalyzer

ANALYZERS_REGISTRY: Dict[str, Analyzer] = {
    "transcript": TranscriptAnalyzer(),
    "default_video": DefaultVideoAnalyzer(),
    "people": PeopleAnalyzer(),
    "object_detection": ObjectDetectionAnalyzer(),
    "ocr": OCRAnalyzer(),
    "diarization": DiarizationAnalyzer(),
}

def get_analyzer(name: str) -> Analyzer | None:
    return ANALYZERS_REGISTRY.get(name)

def get_available_analyzers_meta() -> List[Dict[str, Any]]:
    result = []
    for name, a in ANALYZERS_REGISTRY.items():
        is_ready = True
        if name == "diarization":
            is_ready = getattr(a, "is_available", lambda: False)()
        result.append({
            "id": name,
            "label": a.label,
            "requires": a.requires,
            "available": is_ready,
        })
    return result
