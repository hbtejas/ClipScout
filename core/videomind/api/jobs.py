import os
import json
import asyncio
import threading
from dataclasses import dataclass, asdict, field
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from videomind.paths import get_data_dir
from videomind.chunk import chunk_video, Chunk
from videomind.analyzers import get_analyzer
from videomind.analyzers.base import AnalysisContext, save_analyzer_result, load_all_video_results
from videomind.vectordb.store import index_chunk
from videomind.aggregators import run_all_aggregators

@dataclass
class JobState:
    video_id: str
    status: str  # queued | analyzing | ready | failed
    analysis_stage: str  # chunking | transcribing | embedding | aggregating | ready | failed
    progress: float = 0.0
    error_message: Optional[str] = None
    analyzers_used: List[str] = field(default_factory=list)
    chunking_mode: str = "fixed_interval"
    num_chunks: int = 0
    duration_seconds: float = 0.0
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

_jobs_cache: Dict[str, JobState] = {}
_jobs_lock = threading.Lock()

def get_jobs_dir() -> Path:
    p = get_data_dir() / "jobs"
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_job_file(video_id: str) -> Path:
    return get_jobs_dir() / f"{video_id}.json"

def save_job_state(state: JobState) -> None:
    state.updated_at = datetime.utcnow().isoformat()
    with _jobs_lock:
        _jobs_cache[state.video_id] = state
    p = get_job_file(state.video_id)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(asdict(state), f, indent=2)

def get_job_state(video_id: str) -> Optional[JobState]:
    with _jobs_lock:
        if video_id in _jobs_cache:
            return _jobs_cache[video_id]
    
    p = get_job_file(video_id)
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
            state = JobState(**data)
            with _jobs_lock:
                _jobs_cache[video_id] = state
            return state
    return None

def run_pipeline_sync(
    video_id: str,
    video_path: str,
    analyzers: List[str],
    chunking_mode: str = "fixed_interval",
    interval_s: float = 30.0
):
    state = get_job_state(video_id) or JobState(
        video_id=video_id,
        status="queued",
        analysis_stage="queued",
        analyzers_used=analyzers,
        chunking_mode=chunking_mode
    )

    scratch_dir = get_data_dir() / "scratch" / video_id
    scratch_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Stage 1: Chunking
        state.status = "analyzing"
        state.analysis_stage = "chunking"
        state.progress = 0.1
        save_job_state(state)

        chunks: List[Chunk] = chunk_video(
            video_id=video_id,
            video_path=video_path,
            mode=chunking_mode,
            interval_s=interval_s
        )
        state.num_chunks = len(chunks)
        if chunks:
            state.duration_seconds = chunks[-1].end_s
        save_job_state(state)

        # Stage 2: Running Analyzers
        state.analysis_stage = "transcribing" if "transcript" in analyzers else "analyzing"
        state.progress = 0.25
        save_job_state(state)

        context = AnalysisContext(
            video_id=video_id,
            video_path=video_path,
            scratch_dir=scratch_dir
        )

        total_steps = len(chunks) * max(1, len(analyzers))
        step = 0

        for chunk in chunks:
            for analyzer_name in analyzers:
                analyzer = get_analyzer(analyzer_name)
                if analyzer:
                    try:
                        res = analyzer.run(chunk, context)
                        save_analyzer_result(res)
                    except Exception as err:
                        print(f"Analyzer {analyzer_name} failed on {chunk.chunk_id}: {err}")
                step += 1
                state.progress = round(0.25 + 0.5 * (step / total_steps), 2)
                save_job_state(state)

        # Stage 3: Embedding & Vector Indexing
        state.analysis_stage = "embedding"
        state.progress = 0.8
        save_job_state(state)

        analyzer_outputs = load_all_video_results(video_id)
        for chunk in chunks:
            chunk_results = analyzer_outputs.get(chunk.chunk_id, {})
            # Combine transcript and visual texts
            text_parts = []
            if "transcript" in chunk_results:
                t_text = chunk_results["transcript"].get("data", {}).get("text", "")
                if t_text:
                    text_parts.append(t_text)
            if "default_video" in chunk_results:
                v_desc = chunk_results["default_video"].get("data", {}).get("description", "")
                if v_desc:
                    text_parts.append(v_desc)
            
            combined_text = " ".join(text_parts).strip()
            if not combined_text:
                combined_text = f"Video segment {chunk.start_s:.1f}s to {chunk.end_s:.1f}s"

            index_chunk(
                video_id=video_id,
                chunk_id=chunk.chunk_id,
                start_s=chunk.start_s,
                end_s=chunk.end_s,
                text=combined_text,
                extra_payload={
                    "analyzers_used": analyzers,
                    "transcript_snippet": combined_text[:200]
                }
            )

        # Stage 4: Aggregations
        state.analysis_stage = "aggregating"
        state.progress = 0.9
        save_job_state(state)

        run_all_aggregators(video_id, analyzer_outputs, force=True)

        # Complete
        state.status = "ready"
        state.analysis_stage = "ready"
        state.progress = 1.0
        state.error_message = None
        save_job_state(state)

    except Exception as e:
        state.status = "failed"
        state.analysis_stage = "failed"
        state.error_message = str(e)
        save_job_state(state)
        print(f"Pipeline job failed for {video_id}: {e}")
    finally:
        # Cleanup scratch dir
        if scratch_dir.exists():
            import shutil
            try:
                shutil.rmtree(scratch_dir, ignore_errors=True)
            except Exception:
                pass

def queue_pipeline_job(
    video_id: str,
    video_path: str,
    analyzers: Optional[List[str]] = None,
    chunking_mode: str = "fixed_interval",
    interval_s: float = 30.0
) -> JobState:
    if analyzers is None or len(analyzers) == 0:
        analyzers = ["transcript"]
    
    state = JobState(
        video_id=video_id,
        status="queued",
        analysis_stage="queued",
        analyzers_used=analyzers,
        chunking_mode=chunking_mode
    )
    save_job_state(state)
    
    # Run in background thread
    t = threading.Thread(
        target=run_pipeline_sync,
        args=(video_id, video_path, analyzers, chunking_mode, interval_s),
        daemon=True
    )
    t.start()
    return state
