"""
Unit tests for videomind.aggregators.base — save/load/aggregate logic.
Pure filesystem operations, no model calls.
"""
import json
import pytest
from unittest.mock import patch

from videomind.aggregators.base import (
    AggregatorResult,
    save_aggregate_result,
    load_aggregate_result,
    load_all_aggregates,
)


class TestAggregatorResult:
    def test_fields_present(self):
        r = AggregatorResult(
            aggregator="summary",
            video_id="vid1",
            data={"overview": "A great video"},
        )
        assert r.aggregator == "summary"
        assert r.video_id == "vid1"
        assert r.data["overview"] == "A great video"
        assert r.error is None

    def test_error_field_optional(self):
        r = AggregatorResult(
            aggregator="entities",
            video_id="vid1",
            data={},
            error="LLM unavailable",
        )
        assert r.error == "LLM unavailable"


class TestSaveLoadAggregate:
    def test_save_and_load_roundtrip(self, tmp_path):
        r = AggregatorResult(
            aggregator="summary",
            video_id="vidX",
            data={"overview": "test overview", "key_topics": ["ai", "video"]},
        )
        with patch("videomind.aggregators.base.get_aggregates_dir", return_value=tmp_path):
            save_aggregate_result(r)
            loaded = load_aggregate_result("vidX", "summary")

        assert loaded is not None
        assert loaded["aggregator"] == "summary"
        assert loaded["data"]["overview"] == "test overview"
        assert loaded["data"]["key_topics"] == ["ai", "video"]
        assert loaded["error"] is None

    def test_load_nonexistent_returns_none(self, tmp_path):
        with patch("videomind.aggregators.base.get_aggregates_dir", return_value=tmp_path):
            result = load_aggregate_result("ghost_video", "chapters")
        assert result is None

    def test_save_creates_video_subdirectory(self, tmp_path):
        r = AggregatorResult(aggregator="chapters", video_id="newvid", data={"chapters": []})
        agg_base = tmp_path / "aggregates"
        assert not agg_base.exists()
        with patch("videomind.aggregators.base.get_aggregates_dir", return_value=agg_base):
            save_aggregate_result(r)
        assert (agg_base / "newvid").exists()

    def test_load_all_aggregates_returns_data_section(self, tmp_path):
        """load_all_aggregates should only return the data portion of each file."""
        vid_dir = tmp_path / "vidY"
        vid_dir.mkdir(parents=True)

        (vid_dir / "summary.json").write_text(json.dumps({
            "aggregator": "summary", "video_id": "vidY",
            "data": {"overview": "Great video"}, "error": None
        }), encoding="utf-8")
        (vid_dir / "entities.json").write_text(json.dumps({
            "aggregator": "entities", "video_id": "vidY",
            "data": {"people": ["Alice", "Bob"]}, "error": None
        }), encoding="utf-8")

        with patch("videomind.aggregators.base.get_aggregates_dir", return_value=tmp_path):
            result = load_all_aggregates("vidY")

        assert "summary" in result
        assert "entities" in result
        assert result["summary"]["overview"] == "Great video"
        assert result["entities"]["people"] == ["Alice", "Bob"]

    def test_load_all_aggregates_empty_directory(self, tmp_path):
        """No aggregate files → empty dict."""
        vid_dir = tmp_path / "empty_vid"
        vid_dir.mkdir()
        with patch("videomind.aggregators.base.get_aggregates_dir", return_value=tmp_path):
            result = load_all_aggregates("empty_vid")
        assert result == {}

    def test_load_all_aggregates_nonexistent_video(self, tmp_path):
        """Non-existent video dir → empty dict."""
        with patch("videomind.aggregators.base.get_aggregates_dir", return_value=tmp_path):
            result = load_all_aggregates("totally_missing_vid")
        assert result == {}

    def test_multiple_overwrites_last_write_wins(self, tmp_path):
        """Saving twice for same aggregator/video should overwrite (last write wins)."""
        r1 = AggregatorResult(aggregator="summary", video_id="ov", data={"overview": "v1"})
        r2 = AggregatorResult(aggregator="summary", video_id="ov", data={"overview": "v2"})
        with patch("videomind.aggregators.base.get_aggregates_dir", return_value=tmp_path):
            save_aggregate_result(r1)
            save_aggregate_result(r2)
            loaded = load_aggregate_result("ov", "summary")

        assert loaded["data"]["overview"] == "v2"
