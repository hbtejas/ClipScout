from videomind.analyzers.base import Analyzer, AnalyzerResult, AnalysisContext
from videomind.chunk import Chunk
from videomind.config import settings

class DiarizationAnalyzer(Analyzer):
    name: str = "diarization"
    label: str = "Speaker Diarization (PyAnnote Audio)"
    requires: str = "audio"

    def is_available(self) -> bool:
        return bool(settings.HF_TOKEN)

    def run(self, chunk: Chunk, context: AnalysisContext) -> AnalyzerResult:
        if not self.is_available():
            return AnalyzerResult(
                analyzer=self.name,
                chunk_id=chunk.chunk_id,
                video_id=chunk.video_id,
                start_s=chunk.start_s,
                end_s=chunk.end_s,
                data={},
                error="HF_TOKEN not set for pyannote.audio diarization"
            )
        return AnalyzerResult(
            analyzer=self.name,
            chunk_id=chunk.chunk_id,
            video_id=chunk.video_id,
            start_s=chunk.start_s,
            end_s=chunk.end_s,
            data={"speakers": []}
        )
