import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional
from videomind.config import settings

def get_ffmpeg_binary() -> str:
    """Resolve ffmpeg binary path from settings, PATH, or imageio_ffmpeg."""
    if settings.VIDEOMIND_FFMPEG and os.path.exists(settings.VIDEOMIND_FFMPEG):
        return settings.VIDEOMIND_FFMPEG
    
    which_ffmpeg = shutil.which("ffmpeg")
    if which_ffmpeg:
        return which_ffmpeg
    
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
    
    raise RuntimeError("FFmpeg executable could not be found. Please install ffmpeg or imageio-ffmpeg.")

def get_video_duration(video_path: str | Path) -> float:
    """Get video duration in seconds via ffmpeg/ffprobe or fallback."""
    ffmpeg_exe = get_ffmpeg_binary()
    # Try ffprobe if available
    ffprobe_exe = shutil.which("ffprobe")
    if not ffprobe_exe:
        # Fallback to running ffmpeg -i and parsing output
        cmd = [ffmpeg_exe, "-i", str(video_path)]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors="replace")
        output = res.stderr
        import re
        match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.?\d*)", output)
        if match:
            hours, minutes, seconds = match.groups()
            return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
        # If unable to parse, return 0.0 or raise
        return 0.0
    
    cmd = [
        ffprobe_exe,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(video_path)
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return float(res.stdout.strip())
    except Exception:
        return 0.0

def extract_audio_slice(video_path: str | Path, start_s: float, end_s: float, output_wav_path: str | Path) -> str:
    """Extract a slice of audio from start_s to end_s as a 16kHz mono WAV file."""
    ffmpeg_exe = get_ffmpeg_binary()
    output_path = Path(output_wav_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    duration = max(0.1, end_s - start_s)
    cmd = [
        ffmpeg_exe,
        "-y",
        "-ss", str(start_s),
        "-t", str(duration),
        "-i", str(video_path),
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        str(output_path)
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg audio extraction failed: {res.stderr}")
    return str(output_path)

def extract_full_audio(video_path: str | Path, output_wav_path: str | Path) -> str:
    """Extract full audio as 16kHz mono WAV."""
    ffmpeg_exe = get_ffmpeg_binary()
    output_path = Path(output_wav_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", str(video_path),
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        str(output_path)
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg full audio extraction failed: {res.stderr}")
    return str(output_path)
