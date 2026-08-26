import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol, Literal, Dict, Any, Optional
from videomind.paths import get_analysis_dir
from videomind.chunk import Chunk

@dataclass
class AnalysisContext:
    video_id: str
    video_path: str
    scratch_dir: Path
    extra: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AnalyzerResult:
    analyzer: str
    chunk_id: str
    video_id: str
    start_s: float
    end_s: float
    data: Dict[str, Any]
    error: Optional[str] = None

class Analyzer(Protocol):
    name: str
    label: str
    requires: Literal["frames", "audio", "none"]

    def run(self, chunk: Chunk, context: AnalysisContext) -> AnalyzerResult:
        ...

def get_analyzer_result_path(video_id: str, chunk_id: str, analyzer_name: str) -> Path:
    p = get_analysis_dir() / video_id
    p.mkdir(parents=True, exist_ok=True)
    return p / f"{chunk_id}_{analyzer_name}.json"

def save_analyzer_result(result: AnalyzerResult) -> None:
    path = get_analyzer_result_path(result.video_id, result.chunk_id, result.analyzer)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({
            "analyzer": result.analyzer,
            "chunk_id": result.chunk_id,
            "video_id": result.video_id,
            "start_s": result.start_s,
            "end_s": result.end_s,
            "data": result.data,
            "error": result.error,
        }, f, indent=2)

def load_analyzer_result(video_id: str, chunk_id: str, analyzer_name: str) -> Optional[Dict[str, Any]]:
    path = get_analyzer_result_path(video_id, chunk_id, analyzer_name)
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_all_video_results(video_id: str) -> Dict[str, Dict[str, Any]]:
    """Loads all analyzer results for a video grouped by chunk_id."""
    p = get_analysis_dir() / video_id
    if not p.exists():
        return {}
    
    results: Dict[str, Dict[str, Any]] = {}
    for file in p.glob("*.json"):
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            chunk_id = data.get("chunk_id")
            analyzer = data.get("analyzer")
            if chunk_id and analyzer:
                if chunk_id not in results:
                    results[chunk_id] = {}
                results[chunk_id][analyzer] = data
    return results
