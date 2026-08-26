import json
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol, Dict, Any, Optional
from videomind.paths import get_aggregates_dir

@dataclass
class AggregatorResult:
    aggregator: str
    video_id: str
    data: Dict[str, Any]
    error: Optional[str] = None

class Aggregator(Protocol):
    name: str
    label: str

    def run(self, video_id: str, analyzer_outputs: Dict[str, Dict[str, Any]]) -> AggregatorResult:
        ...

def get_aggregate_file_path(video_id: str, aggregator_name: str) -> Path:
    p = get_aggregates_dir() / video_id
    p.mkdir(parents=True, exist_ok=True)
    return p / f"{aggregator_name}.json"

def save_aggregate_result(result: AggregatorResult) -> None:
    p = get_aggregate_file_path(result.video_id, result.aggregator)
    with open(p, "w", encoding="utf-8") as f:
        json.dump({
            "aggregator": result.aggregator,
            "video_id": result.video_id,
            "data": result.data,
            "error": result.error
        }, f, indent=2)

def load_aggregate_result(video_id: str, aggregator_name: str) -> Optional[Dict[str, Any]]:
    p = get_aggregate_file_path(video_id, aggregator_name)
    if not p.exists():
        return None
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def load_all_aggregates(video_id: str) -> Dict[str, Any]:
    p = get_aggregates_dir() / video_id
    if not p.exists():
        return {}
    res = {}
    for f in p.glob("*.json"):
        with open(f, "r", encoding="utf-8") as open_f:
            data = json.load(open_f)
            agg = data.get("aggregator", f.stem)
            res[agg] = data.get("data", {})
    return res
