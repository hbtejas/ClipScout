from typing import Dict, Any
from videomind.aggregators.base import Aggregator, AggregatorResult

class EntitiesAggregator(Aggregator):
    name: str = "entities"
    label: str = "Cross-Chunk Entity Tracker"

    def run(self, video_id: str, analyzer_outputs: Dict[str, Dict[str, Any]]) -> AggregatorResult:
        # Aggregate recognized entities (people, objects, locations) across chunks
        return AggregatorResult(
            aggregator=self.name,
            video_id=video_id,
            data={"people": [], "objects": [], "topics": []}
        )
