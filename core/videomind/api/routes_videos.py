import os
import hashlib
import uuid
import httpx
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel
from videomind.paths import get_cache_dir
from videomind.config import settings
from videomind.api.jobs import queue_pipeline_job, get_job_state
from videomind.chunk import load_chunks
from videomind.analyzers.base import load_all_video_results

router = APIRouter(prefix="/videos", tags=["Videos"])

class IngestUrlRequest(BaseModel):
    url: str
    analyzers: Optional[List[str]] = None
    chunking_mode: Optional[str] = "fixed_interval"
    interval_s: Optional[float] = 30.0

def compute_file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()[:16]

async def download_url(url: str, output_path: Path) -> None:
    # Check if it's YouTube / video platform URL
    if "youtube.com" in url or "youtu.be" in url:
        import yt_dlp
        ydl_opts = {
            "format": "best[ext=mp4]/best",
            "outtmpl": str(output_path),
            "max_filesize": settings.VIDEOMIND_MAX_BYTES,
            "quiet": True,
            "no_warnings": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return

    # Direct HTTP download with standard browser headers
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
    }
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=120.0) as client:
        async with client.stream("GET", url) as response:
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Failed to fetch video URL: HTTP {response.status_code}")
            with open(output_path, "wb") as f:
                async for chunk in response.aiter_bytes():
                    f.write(chunk)

@router.post("")
async def ingest_video(
    request: Request,
):
    content_type = request.headers.get("content-type", "")
    analyzers_list = ["transcript"]
    target_url = None
    mode = "fixed_interval"
    interval = 30.0
    file_upload: Optional[UploadFile] = None
    raw_file_bytes: Optional[bytes] = None
    filename: Optional[str] = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            if isinstance(body, dict):
                target_url = body.get("url")
                if body.get("analyzers"):
                    analyzers_list = body.get("analyzers")
                if body.get("chunking_mode"):
                    mode = body.get("chunking_mode")
                if body.get("interval_s"):
                    interval = float(body.get("interval_s"))
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            target_url = form.get("url")
            analyzers_val = form.get("analyzers")
            if analyzers_val and isinstance(analyzers_val, str):
                analyzers_list = [a.strip() for a in analyzers_val.split(",") if a.strip()]
            if form.get("chunking_mode"):
                mode = str(form.get("chunking_mode"))
            if form.get("interval_s"):
                try:
                    interval = float(form.get("interval_s"))
                except ValueError:
                    pass
            form_file = form.get("file")
            if isinstance(form_file, UploadFile):
                file_upload = form_file
                filename = form_file.filename
                raw_file_bytes = await form_file.read()
        except Exception:
            pass

    # Fallback to query params if still not found
    if not target_url and not file_upload:
        query_url = request.query_params.get("url")
        if query_url:
            target_url = query_url

    if not file_upload and not target_url:
        raise HTTPException(status_code=400, detail="Provide either a video file upload or a url parameter")

    video_id = str(uuid.uuid4())[:8]
    cache_dir = get_cache_dir()

    if file_upload and raw_file_bytes:
        file_ext = Path(filename or "video.mp4").suffix or ".mp4"
        dest_path = cache_dir / f"{video_id}{file_ext}"
        with open(dest_path, "wb") as f:
            f.write(raw_file_bytes)
        
        # Determine content hash ID for idempotency
        content_hash = compute_file_hash(dest_path)
        canonical_path = cache_dir / f"{content_hash}{file_ext}"
        if canonical_path.exists():
            dest_path.unlink()
            final_path = canonical_path
            video_id = content_hash
        else:
            dest_path.rename(canonical_path)
            final_path = canonical_path
            video_id = content_hash

    elif target_url:
        temp_dest = cache_dir / f"temp_{video_id}.mp4"
        try:
            await download_url(target_url, temp_dest)
            content_hash = compute_file_hash(temp_dest)
            canonical_path = cache_dir / f"{content_hash}.mp4"
            if canonical_path.exists():
                temp_dest.unlink()
                final_path = canonical_path
                video_id = content_hash
            else:
                temp_dest.rename(canonical_path)
                final_path = canonical_path
                video_id = content_hash
        except Exception as e:
            if temp_dest.exists():
                temp_dest.unlink()
            raise HTTPException(status_code=400, detail=f"Failed downloading video: {e}")
    else:
        raise HTTPException(status_code=400, detail="Provide either a video file upload or a url parameter")

    # Queue background processing pipeline
    queue_pipeline_job(
        video_id=video_id,
        video_path=str(final_path),
        analyzers=analyzers_list,
        chunking_mode=mode,
        interval_s=interval
    )

    return {
        "video_id": video_id,
        "status": "queued",
        "message": "Video ingestion started in background"
    }

@router.get("/{id}")
async def get_video_status(id: str):
    state = get_job_state(id)
    if not state:
        raise HTTPException(status_code=404, detail="Video not found")
    return state

@router.get("/{id}/transcript")
async def get_video_transcript(id: str):
    state = get_job_state(id)
    if not state:
        raise HTTPException(status_code=404, detail="Video not found")
    
    results = load_all_video_results(id)
    segments = []
    full_text_pieces = []

    # Sort chunks by start_s
    chunks = load_chunks(id)
    for chunk in chunks:
        chunk_data = results.get(chunk.chunk_id, {})
        t_res = chunk_data.get("transcript", {})
        t_data = t_res.get("data", {})
        text = t_data.get("text", "").strip()
        chunk_segs = t_data.get("segments", [])
        
        if chunk_segs:
            for s in chunk_segs:
                segments.append(s)
        elif text:
            segments.append({
                "start": chunk.start_s,
                "end": chunk.end_s,
                "text": text
            })
            
        if text:
            full_text_pieces.append(text)

    return {
        "video_id": id,
        "full_text": " ".join(full_text_pieces),
        "segments": segments,
        "num_segments": len(segments)
    }

@router.get("/{id}/chunks/{chunk_id}")
async def get_chunk_data(id: str, chunk_id: str):
    results = load_all_video_results(id)
    chunk_data = results.get(chunk_id)
    if not chunk_data:
        raise HTTPException(status_code=404, detail="Chunk data not found")
    return {
        "video_id": id,
        "chunk_id": chunk_id,
        "analyzers": chunk_data
    }
