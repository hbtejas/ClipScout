"""
Unit tests for videomind.analyzers.base — save/load result structure.
No real video processing — tests filesystem I/O patterns and data integrity.
"""
import json
import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

from videomind.analyzers.base import (
    AnalyzerResult,
    AnalysisContext,
    save_analyzer_result,
    load_analyzer_result,
    load_all_video_results,
    get_analyzer_result_path,
)


class TestAnalyzerResult:
    def test_dataclass_fields(self):
        result = AnalyzerResult(
            analyzer="transcript",
            chunk_id="vid1_c000",
            video_id="vid1",
            start_s=0.0,
            end_s=30.0,
            data={"text": "hello world"},
        )
        assert result.analyzer == "transcript"
        assert result.chunk_id == "vid1_c000"
        assert result.video_id == "vid1"
        assert result.start_s == 0.0
        assert result.end_s == 30.0
        assert result.data == {"text": "hello world"}
        assert result.error is None

    def test_error_field_optional(self):
        result = AnalyzerResult(
            analyzer="ocr",
            chunk_id="vid1_c001",
            video_id="vid1",
            start_s=30.0,
            end_s=60.0,
            data={},
            error="something went wrong",
        )
        assert result.error == "something went wrong"


class TestSaveLoadAnalyzerResult:
    def test_save_and_load_roundtrip(self, tmp_path):
        """Save a result, load it back, verify every field matches."""
        result = AnalyzerResult(
            analyzer="transcript",
            chunk_id="test_c000",
            video_id="test",
            start_s=0.0,
            end_s=30.0,
            data={"text": "hello", "segments": [{"start": 0.0, "end": 5.0, "text": "hello"}]},
        )
        with patch("videomind.analyzers.base.get_analysis_dir", return_value=tmp_path):
            save_analyzer_result(result)
            loaded = load_analyzer_result("test", "test_c000", "transcript")

        assert loaded is not None
        assert loaded["analyzer"] == "transcript"
        assert loaded["chunk_id"] == "test_c000"
        assert loaded["video_id"] == "test"
        assert loaded["start_s"] == 0.0
        assert loaded["end_s"] == 30.0
        assert loaded["data"]["text"] == "hello"
        assert loaded["error"] is None

    def test_load_nonexistent_returns_none(self, tmp_path):
        with patch("videomind.analyzers.base.get_analysis_dir", return_value=tmp_path):
            result = load_analyzer_result("nonexistent_vid", "nonexistent_chunk", "transcript")
        assert result is None

    def test_save_creates_directory(self, tmp_path):
        result = AnalyzerResult(
            analyzer="default_video",
            chunk_id="vid2_c000",
            video_id="vid2",
            start_s=0.0,
            end_s=30.0,
            data={"description": "a test scene"},
        )
        analysis_base = tmp_path / "analysis"
        # Directory should NOT exist yet
        assert not analysis_base.exists()
        with patch("videomind.analyzers.base.get_analysis_dir", return_value=analysis_base):
            save_analyzer_result(result)
        assert (analysis_base / "vid2").exists()

    def test_load_all_video_results_groups_by_chunk(self, tmp_path):
        """load_all_video_results should group results by chunk_id."""
        # Manually write two results for the same video
        vid_dir = tmp_path / "test_vid"
        vid_dir.mkdir(parents=True)

        r1 = {"analyzer": "transcript", "chunk_id": "test_vid_c000", "video_id": "test_vid",
               "start_s": 0.0, "end_s": 30.0, "data": {"text": "hello"}, "error": None}
        r2 = {"analyzer": "ocr", "chunk_id": "test_vid_c000", "video_id": "test_vid",
               "start_s": 0.0, "end_s": 30.0, "data": {"text": []}, "error": None}
        r3 = {"analyzer": "transcript", "chunk_id": "test_vid_c001", "video_id": "test_vid",
               "start_s": 30.0, "end_s": 60.0, "data": {"text": "world"}, "error": None}

        (vid_dir / "test_vid_c000_transcript.json").write_text(json.dumps(r1), encoding="utf-8")
        (vid_dir / "test_vid_c000_ocr.json").write_text(json.dumps(r2), encoding="utf-8")
        (vid_dir / "test_vid_c001_transcript.json").write_text(json.dumps(r3), encoding="utf-8")

        with patch("videomind.analyzers.base.get_analysis_dir", return_value=tmp_path):
            all_results = load_all_video_results("test_vid")

        assert "test_vid_c000" in all_results
        assert "test_vid_c001" in all_results
        assert "transcript" in all_results["test_vid_c000"]
        assert "ocr" in all_results["test_vid_c000"]
        assert "transcript" in all_results["test_vid_c001"]

    def test_load_all_video_results_nonexistent_video(self, tmp_path):
        """Missing video directory returns empty dict."""
        with patch("videomind.analyzers.base.get_analysis_dir", return_value=tmp_path):
            result = load_all_video_results("totally_fake_video")
        assert result == {}

    def test_error_field_preserved_through_roundtrip(self, tmp_path):
        result = AnalyzerResult(
            analyzer="people",
            chunk_id="vid_err_c000",
            video_id="vid_err",
            start_s=0.0,
            end_s=30.0,
            data={},
            error="API timeout: request took 60s",
        )
        with patch("videomind.analyzers.base.get_analysis_dir", return_value=tmp_path):
            save_analyzer_result(result)
            loaded = load_analyzer_result("vid_err", "vid_err_c000", "people")

        assert loaded["error"] == "API timeout: request took 60s"
