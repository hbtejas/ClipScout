from videomind.analyzers.base import Analyzer, AnalyzerResult, AnalysisContext
from videomind.chunk import Chunk

class OCRAnalyzer(Analyzer):
    name: str = "ocr"
    label: str = "On-Screen Text & OCR (EasyOCR Gate + VLM)"
    requires: str = "frames"

    def run(self, chunk: Chunk, context: AnalysisContext) -> AnalyzerResult:
        return AnalyzerResult(
            analyzer=self.name,
            chunk_id=chunk.chunk_id,
            video_id=chunk.video_id,
            start_s=chunk.start_s,
            end_s=chunk.end_s,
            data={"text_regions": []}
        )
