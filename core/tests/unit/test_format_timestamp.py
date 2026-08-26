"""
Unit tests for the format_timestamp utility in routes_search.py
and for the SearchRequest/AskRequest models.
"""
import pytest
from videomind.api.routes_search import format_timestamp


class TestFormatTimestamp:
    def test_zero_seconds(self):
        assert format_timestamp(0.0) == "0:00"

    def test_exact_minute(self):
        assert format_timestamp(60.0) == "1:00"

    def test_seconds_padding(self):
        assert format_timestamp(65.0) == "1:05"

    def test_30_seconds(self):
        assert format_timestamp(30.0) == "0:30"

    def test_no_padding_for_ge_10s(self):
        assert format_timestamp(72.0) == "1:12"

    def test_over_one_hour(self):
        assert format_timestamp(3661.0) == "61:01"

    def test_fractional_seconds_truncated(self):
        # int() truncates, so 30.9 → 0:30
        assert format_timestamp(30.9) == "0:30"

    def test_large_value(self):
        # 2 hours = 7200 seconds
        assert format_timestamp(7200.0) == "120:00"

    def test_negative_input_does_not_crash(self):
        # int(-5) = -5 // 60 = 0, -5 % 60 = -5 → implementation-specific
        # We just test it doesn't raise an exception
        result = format_timestamp(-5.0)
        assert isinstance(result, str)

    def test_output_format_always_colon_separated(self):
        for secs in [0, 1, 59, 60, 119, 3600]:
            result = format_timestamp(float(secs))
            assert ":" in result
            parts = result.split(":")
            assert len(parts) == 2

    def test_seconds_part_always_2_digits(self):
        for secs in [0, 1, 9, 10, 59]:
            result = format_timestamp(float(secs))
            sec_part = result.split(":")[1]
            assert len(sec_part) == 2, f"Expected 2-digit seconds, got '{sec_part}' for {secs}s"
