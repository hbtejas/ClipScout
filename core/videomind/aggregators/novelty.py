from typing import Dict, Any
from videomind.aggregators.base import Aggregator, AggregatorResult

class NoveltyAggregator(Aggregator):
    name: str = "novelty"
    label: str = "Outlier & Novelty Detection"

    def run(self, video_id: str, analyzer_outputs: Dict[str, Dict[str, Any]]) -> AggregatorResult:
        return AggregatorResult(
            aggregator=self.name,
            video_id=video_id,
            data={"highlights": [], "novel_moments": []}
        )
