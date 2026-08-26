"""
Unit tests for videomind.chunk — chunk_fixed_interval edge cases.
No external dependencies. Pure logic only.
"""
import pytest
from videomind.chunk import chunk_fixed_interval, Chunk


class TestChunkFixedInterval:
    def test_normal_video_30s_interval(self):
        """90-second video at 30s = 3 chunks."""
        chunks = chunk_fixed_interval("vid1", 90.0, interval_s=30.0)
        assert len(chunks) == 3
        assert chunks[0].start_s == 0.0
        assert chunks[0].end_s == 30.0
        assert chunks[1].start_s == 30.0
        assert chunks[1].end_s == 60.0
        assert chunks[2].start_s == 60.0
        assert chunks[2].end_s == 90.0

    def test_chunk_ids_sequential(self):
        """Chunk IDs follow the c000, c001, ... convention."""
        chunks = chunk_fixed_interval("myvid", 90.0, interval_s=30.0)
        assert chunks[0].chunk_id == "myvid_c000"
        assert chunks[1].chunk_id == "myvid_c001"
        assert chunks[2].chunk_id == "myvid_c002"

    def test_all_chunks_have_correct_video_id(self):
        chunks = chunk_fixed_interval("vidABC", 90.0, interval_s=30.0)
        for chunk in chunks:
            assert chunk.video_id == "vidABC"

    def test_zero_duration_returns_single_fallback_chunk(self):
        """A zero-duration video returns a single 0.0–30.0 fallback chunk."""
        chunks = chunk_fixed_interval("vid0", 0.0, interval_s=30.0)
        assert len(chunks) == 1
        assert chunks[0].start_s == 0.0
        assert chunks[0].end_s == 30.0

    def test_negative_duration_treated_as_zero(self):
        """Negative duration also falls back to single chunk."""
        chunks = chunk_fixed_interval("vidneg", -5.0, interval_s=30.0)
        assert len(chunks) == 1

    def test_single_chunk_exact_interval(self):
        """Exactly 30s video at 30s interval = exactly 1 chunk."""
        chunks = chunk_fixed_interval("vid1x", 30.0, interval_s=30.0)
        assert len(chunks) == 1
        assert chunks[0].start_s == 0.0
        assert chunks[0].end_s == 30.0

    def test_tiny_residual_merged_into_last_chunk(self):
        """A residual of < 2s should be absorbed by the previous chunk."""
        # 31.5s with 30s interval: would produce [0–30, 30–31.5]
        # The residual (31.5 - 30 = 1.5 < 2) should be merged
        chunks = chunk_fixed_interval("vidresidual", 31.5, interval_s=30.0)
        assert len(chunks) == 1
        assert chunks[0].end_s == 31.5

    def test_residual_above_2s_makes_two_chunks(self):
        """A residual of >= 2s should remain a separate chunk."""
        # 32.5s with 30s interval: residual = 2.5s >= 2.0 → 2 chunks
        chunks = chunk_fixed_interval("vid325", 32.5, interval_s=30.0)
        assert len(chunks) == 2
        assert chunks[1].end_s == 32.5

    def test_chunks_are_contiguous_no_gaps(self):
        """Chunk boundaries must be perfectly contiguous."""
        chunks = chunk_fixed_interval("vidgap", 95.0, interval_s=30.0)
        for i in range(1, len(chunks)):
            assert chunks[i].start_s == chunks[i - 1].end_s

    def test_last_chunk_ends_at_video_duration(self):
        chunks = chunk_fixed_interval("vidend", 95.0, interval_s=30.0)
        assert chunks[-1].end_s == 95.0

    def test_short_video_under_interval(self):
        """A 10s video at 30s interval → 1 chunk from 0 to 10."""
        chunks = chunk_fixed_interval("short", 10.0, interval_s=30.0)
        assert len(chunks) == 1
        assert chunks[0].start_s == 0.0
        assert chunks[0].end_s == 10.0

    def test_large_video_many_chunks(self):
        """60-minute video at 30s = 120 chunks exactly."""
        chunks = chunk_fixed_interval("longvid", 3600.0, interval_s=30.0)
        assert len(chunks) == 120

    def test_chunk_returns_dataclass_instances(self):
        chunks = chunk_fixed_interval("dtype", 60.0, interval_s=30.0)
        for c in chunks:
            assert isinstance(c, Chunk)
            assert hasattr(c, 'chunk_id')
            assert hasattr(c, 'video_id')
            assert hasattr(c, 'start_s')
            assert hasattr(c, 'end_s')

    def test_float_precision_rounded_to_2dp(self):
        """start_s and end_s should be rounded to 2 decimal places."""
        chunks = chunk_fixed_interval("vidprec", 30.0, interval_s=30.0)
        assert isinstance(chunks[0].start_s, float)
        # Ensure no floating-point chaos beyond 2dp
        assert round(chunks[0].start_s, 2) == chunks[0].start_s
