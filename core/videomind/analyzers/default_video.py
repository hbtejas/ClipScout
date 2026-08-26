from videomind.analyzers.base import Analyzer, AnalyzerResult, AnalysisContext
from videomind.chunk import Chunk
from videomind.extractors.frames import sample_chunk_frames

class DefaultVideoAnalyzer(Analyzer):
    name: str = "default_video"
    label: str = "Visual Scene & Action Description (VLM)"
    requires: str = "frames"

    def run(self, chunk: Chunk, context: AnalysisContext) -> AnalyzerResult:
        frame_paths = sample_chunk_frames(context.video_path, chunk.start_s, chunk.end_s, context.scratch_dir, num_frames=3)
        # Phase 3 VLM integration placeholder
        return AnalyzerResult(
            analyzer=self.name,
            chunk_id=chunk.chunk_id,
            video_id=chunk.video_id,
            start_s=chunk.start_s,
            end_s=chunk.end_s,
            data={
                "description": f"Visual scene at {chunk.start_s}s - {chunk.end_s}s",
                "setting": "indoor/outdoor",
                "actions": [],
                "tags": []
            }
        )
