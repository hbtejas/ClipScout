from typing import Dict
from videomind.aggregators.base import Aggregator
from videomind.aggregators.summary import SummaryAggregator
from videomind.aggregators.chapters import ChaptersAggregator
from videomind.aggregators.entities import EntitiesAggregator
from videomind.aggregators.novelty import NoveltyAggregator

AGGREGATORS_REGISTRY: Dict[str, Aggregator] = {
    "summary": SummaryAggregator(),
    "chapters": ChaptersAggregator(),
    "entities": EntitiesAggregator(),
    "novelty": NoveltyAggregator(),
}

def run_all_aggregators(video_id: str, analyzer_outputs: dict, force: bool = False):
    from videomind.aggregators.base import save_aggregate_result, load_aggregate_result
    for name, agg in AGGREGATORS_REGISTRY.items():
        if not force and load_aggregate_result(video_id, name) is not None:
            continue
        try:
            res = agg.run(video_id, analyzer_outputs)
            save_aggregate_result(res)
        except Exception as e:
            from videomind.aggregators.base import AggregatorResult
            save_aggregate_result(AggregatorResult(aggregator=name, video_id=video_id, data={}, error=str(e)))
