from typing import Dict, Any
from videomind.aggregators.base import Aggregator, AggregatorResult

class ChaptersAggregator(Aggregator):
    name: str = "chapters"
    label: str = "Video Chapters & Timeline"

    def run(self, video_id: str, analyzer_outputs: Dict[str, Dict[str, Any]]) -> AggregatorResult:
        chapters = []
        for chunk_id, res in sorted(analyzer_outputs.items(), key=lambda x: x[1].get("transcript", {}).get("start_s", 0.0)):
            t_res = res.get("transcript", {})
            start_s = t_res.get("start_s", 0.0)
            end_s = t_res.get("end_s", 0.0)
            text = t_res.get("data", {}).get("text", "")
            title = text[:40] + "..." if len(text) > 40 else (text or f"Segment {start_s:.0f}s - {end_s:.0f}s")
            chapters.append({
                "chapter_id": chunk_id,
                "title": title,
                "start_s": start_s,
                "end_s": end_s
            })
        return AggregatorResult(
            aggregator=self.name,
            video_id=video_id,
            data={"chapters": chapters}
        )
