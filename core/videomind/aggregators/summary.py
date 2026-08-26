from typing import Dict, Any
from videomind.aggregators.base import Aggregator, AggregatorResult

class SummaryAggregator(Aggregator):
    name: str = "summary"
    label: str = "Whole-Video Executive Summary"

    def run(self, video_id: str, analyzer_outputs: Dict[str, Dict[str, Any]]) -> AggregatorResult:
        # Collect transcript snippets
        transcript_pieces = []
        for chunk_id, results in analyzer_outputs.items():
            if "transcript" in results:
                t_data = results["transcript"].get("data", {})
                text = t_data.get("text", "")
                if text:
                    transcript_pieces.append(text)
        
        full_transcript = " ".join(transcript_pieces).strip()
        summary_text = full_transcript[:300] + "..." if len(full_transcript) > 300 else full_transcript
        if not summary_text:
            summary_text = "No audio transcript detected for this video."

        return AggregatorResult(
            aggregator=self.name,
            video_id=video_id,
            data={
                "overview": summary_text,
                "key_takeaways": [],
                "duration_summary": f"{len(analyzer_outputs)} chunks indexed"
            }
        )
