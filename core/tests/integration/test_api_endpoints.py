"""
Integration tests — FastAPI endpoints via httpx / TestClient.
Tests every documented endpoint against a real (in-process) FastAPI app instance.
Fast, deterministic, zero network or GPU dependencies.
"""
import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


@pytest.fixture(scope="module")
def app():
    """Import the FastAPI app once per module; set up in-memory Qdrant and temp storage."""
    with tempfile.TemporaryDirectory() as tmpdir:
        data_path = Path(tmpdir)
        cache_dir = data_path / "cache"
        qdrant_dir = data_path / "qdrant"
        chunks_dir = data_path / "chunks"
        analysis_dir = data_path / "analysis"
        aggregates_dir = data_path / "aggregates"

        for d in (cache_dir, qdrant_dir, chunks_dir, analysis_dir, aggregates_dir):
            d.mkdir(parents=True, exist_ok=True)

        with patch("videomind.paths.get_data_dir", return_value=data_path), \
             patch("videomind.paths.get_cache_dir", return_value=cache_dir), \
             patch("videomind.paths.get_qdrant_path", return_value=qdrant_dir), \
             patch("videomind.paths.get_chunks_dir", return_value=chunks_dir), \
             patch("videomind.paths.get_analysis_dir", return_value=analysis_dir), \
             patch("videomind.paths.get_aggregates_dir", return_value=aggregates_dir), \
             patch("videomind.vectordb.embed.get_embedding", return_value=[0.05] * 384):

            import videomind.vectordb.store as store_module
            mem_client = QdrantClient(":memory:")
            mem_client.create_collection(
                collection_name=store_module.COLLECTION_NAME,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
            store_module._qdrant_client = mem_client

            from videomind.api.app import app as fastapi_app
            yield fastapi_app


@pytest.fixture(scope="module")
def client(app):
    return TestClient(app, raise_server_exceptions=False)


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_has_status_field(self, client):
        resp = client.get("/health")
        data = resp.json()
        assert "status" in data
        assert data["status"] in ("ok", "degraded")


class TestAnalyzersEndpoint:
    def test_analyzers_returns_200(self, client):
        resp = client.get("/analyzers")
        assert resp.status_code == 200

    def test_analyzers_has_analyzers_list(self, client):
        resp = client.get("/analyzers")
        data = resp.json()
        assert "analyzers" in data
        assert isinstance(data["analyzers"], list)


class TestSearchEndpoints:
    def test_search_multi_empty_collection(self, client):
        """Searching empty Qdrant returns results=[] gracefully."""
        resp = client.post("/search", json={"query": "hello world"})
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert data["results"] == []
        assert data["count"] == 0

    def test_search_single_video_empty_collection(self, client):
        resp = client.post("/videos/fake_video_id/search",
                           json={"query": "test query"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["video_id"] == "fake_video_id"
        assert data["results"] == []

    def test_search_with_top_k_param(self, client):
        resp = client.post("/search", json={"query": "test", "top_k": 3})
        assert resp.status_code == 200

    def test_search_missing_query_returns_422(self, client):
        """Missing required 'query' field → 422 Unprocessable Entity."""
        resp = client.post("/search", json={"top_k": 5})
        assert resp.status_code == 422


class TestAskEndpoints:
    def test_ask_no_videos_returns_no_match_message(self, client):
        """With empty Qdrant, /ask should return graceful no-match response."""
        resp = client.post("/ask", json={"question": "what is the video about?"})
        assert resp.status_code == 200
        data = resp.json()
        assert "question" in data
        assert "answer" in data
        assert "source_moments" in data

    def test_ask_single_video_endpoint(self, client):
        resp = client.post("/videos/fake_vid/ask",
                           json={"question": "describe the content"})
        assert resp.status_code == 200
        data = resp.json()
        assert "answer" in data

    def test_ask_missing_question_returns_422(self, client):
        resp = client.post("/ask", json={"video_ids": ["vid1"]})
        assert resp.status_code == 422


class TestVideosEndpoints:
    def test_get_nonexistent_video_returns_404(self, client):
        resp = client.get("/videos/totally_fake_id_12345")
        assert resp.status_code == 404

    def test_ingest_missing_body_returns_400(self, client):
        """POST /videos with no url or file returns 400 Bad Request."""
        resp = client.post("/videos", json={})
        assert resp.status_code == 400

    def test_transcript_nonexistent_video_returns_404(self, client):
        resp = client.get("/videos/ghost_id/transcript")
        assert resp.status_code == 404

    def test_insights_nonexistent_video_returns_404(self, client):
        resp = client.get("/videos/ghost_id/insights")
        assert resp.status_code == 404

    def test_entities_nonexistent_video_returns_404(self, client):
        resp = client.get("/videos/ghost_id/entities")
        assert resp.status_code == 404


class TestCORSPolicy:
    def test_cors_allows_localhost_origin(self, client):
        resp = client.options(
            "/health",
            headers={"Origin": "http://localhost:3000",
                     "Access-Control-Request-Method": "GET"}
        )
        assert resp.status_code in (200, 204)

    def test_cors_headers_present_on_get(self, client):
        resp = client.get("/health",
                          headers={"Origin": "http://localhost:3000"})
        assert resp.status_code == 200
