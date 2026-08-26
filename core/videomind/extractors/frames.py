import os
import subprocess
from pathlib import Path
from typing import List
from videomind.extractors.audio import get_ffmpeg_binary

def sample_chunk_frames(
    video_path: str | Path,
    start_s: float,
    end_s: float,
    output_dir: str | Path,
    num_frames: int = 3
) -> List[str]:
    """Sample N evenly spaced frames between start_s and end_s."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    ffmpeg_exe = get_ffmpeg_binary()
    
    duration = max(0.1, end_s - start_s)
    interval = duration / (num_frames + 1)
    frame_paths = []

    for i in range(1, num_frames + 1):
        target_time = start_s + (i * interval)
        frame_filename = f"frame_{target_time:.2f}s.jpg"
        out_file = output_dir / frame_filename
        
        cmd = [
            ffmpeg_exe,
            "-y",
            "-ss", str(target_time),
            "-i", str(video_path),
            "-frames:v", "1",
            "-q:v", "2",
            str(out_file)
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if out_file.exists():
            frame_paths.append(str(out_file))

    return frame_paths
