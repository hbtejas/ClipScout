import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Literal
from videomind.paths import get_chunks_dir
from videomind.extractors.audio import get_video_duration

@dataclass
class Chunk:
    chunk_id: str
    video_id: str
    start_s: float
    end_s: float

def get_chunk_file_path(video_id: str) -> Path:
    return get_chunks_dir() / f"{video_id}.json"

def load_chunks(video_id: str) -> List[Chunk]:
    p = get_chunk_file_path(video_id)
    if not p.exists():
        return []
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)
        return [Chunk(**item) for item in data]

def save_chunks(video_id: str, chunks: List[Chunk]) -> None:
    p = get_chunk_file_path(video_id)
    with open(p, "w", encoding="utf-8") as f:
        json.dump([asdict(c) for c in chunks], f, indent=2)

def chunk_fixed_interval(video_id: str, duration: float, interval_s: float = 30.0) -> List[Chunk]:
    chunks: List[Chunk] = []
    if duration <= 0:
        # Default single chunk if duration couldn't be detected
        return [Chunk(chunk_id=f"{video_id}_c000", video_id=video_id, start_s=0.0, end_s=30.0)]
    
    current_start = 0.0
    idx = 0
    while current_start < duration:
        current_end = min(current_start + interval_s, duration)
        # Avoid tiny residual chunks (< 2.0s) at the very end
        if duration - current_end < 2.0 and current_end < duration:
            current_end = duration
        
        chunk_id = f"{video_id}_c{idx:03d}"
        chunks.append(Chunk(
            chunk_id=chunk_id,
            video_id=video_id,
            start_s=round(current_start, 2),
            end_s=round(current_end, 2)
        ))
        idx += 1
        current_start = current_end
        if current_end >= duration:
            break
            
    return chunks

def chunk_video(
    video_id: str,
    video_path: str | Path,
    mode: Literal["fixed_interval", "fused_signals"] = "fixed_interval",
    interval_s: float = 30.0
) -> List[Chunk]:
    """Orchestrate chunking and persist results."""
    # Check if already chunked
    existing = load_chunks(video_id)
    if existing:
        return existing

    duration = get_video_duration(video_path)
    
    if mode == "fused_signals":
        # Placeholder for fused_signals in Phase 3, falls back to fixed_interval if boundary detectors not active
        chunks = chunk_fixed_interval(video_id, duration, interval_s)
    else:
        chunks = chunk_fixed_interval(video_id, duration, interval_s)
        
    save_chunks(video_id, chunks)
    return chunks
