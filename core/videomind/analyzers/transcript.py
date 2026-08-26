import os
from typing import Optional, Any
from pathlib import Path
from videomind.analyzers.base import Analyzer, AnalyzerResult, AnalysisContext
from videomind.chunk import Chunk
from videomind.extractors.audio import extract_audio_slice
from videomind.config import settings

_whisper_model: Optional[Any] = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        model_name = settings.DEFAULT_WHISPER_MODEL
        # Check if cuda is available
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _whisper_model = whisper.load_model(model_name, device=device)
    return _whisper_model

class TranscriptAnalyzer(Analyzer):
    name: str = "transcript"
    label: str = "Audio Transcription (Whisper)"
    requires: str = "audio"

    def run(self, chunk: Chunk, context: AnalysisContext) -> AnalyzerResult:
        wav_path = context.scratch_dir / f"{chunk.chunk_id}_audio.wav"
        try:
            extract_audio_slice(context.video_path, chunk.start_s, chunk.end_s, wav_path)
            model = get_whisper_model()
            
            result = model.transcribe(
                str(wav_path),
                fp16=False,
                language=None, # auto-detect
                verbose=False
            )
            
            full_text = result.get("text", "").strip()
            segments = []
            for seg in result.get("segments", []):
                # Adjust segment timestamps relative to video origin
                seg_start = round(chunk.start_s + float(seg.get("start", 0.0)), 2)
                seg_end = round(chunk.start_s + float(seg.get("end", 0.0)), 2)
                segments.append({
                    "start": seg_start,
                    "end": seg_end,
                    "text": seg.get("text", "").strip()
                })
            
            return AnalyzerResult(
                analyzer=self.name,
                chunk_id=chunk.chunk_id,
                video_id=chunk.video_id,
                start_s=chunk.start_s,
                end_s=chunk.end_s,
                data={
                    "text": full_text,
                    "language": result.get("language", "en"),
                    "segments": segments
                }
            )
        except Exception as e:
            return AnalyzerResult(
                analyzer=self.name,
                chunk_id=chunk.chunk_id,
                video_id=chunk.video_id,
                start_s=chunk.start_s,
                end_s=chunk.end_s,
                data={"text": "", "segments": []},
                error=str(e)
            )
        finally:
            if wav_path.exists():
                try:
                    wav_path.unlink()
                except Exception:
                    pass
