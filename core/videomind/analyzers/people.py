from videomind.analyzers.base import Analyzer, AnalyzerResult, AnalysisContext
from videomind.chunk import Chunk

class PeopleAnalyzer(Analyzer):
    name: str = "people"
    label: str = "People & Appearance (VLM)"
    requires: str = "frames"

    def run(self, chunk: Chunk, context: AnalysisContext) -> AnalyzerResult:
        return AnalyzerResult(
            analyzer=self.name,
            chunk_id=chunk.chunk_id,
            video_id=chunk.video_id,
            start_s=chunk.start_s,
            end_s=chunk.end_s,
            data={"people": []}
        )
