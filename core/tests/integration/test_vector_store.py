"""
Integration tests for videomind.vectordb.store — index_chunk and search_chunks.
Uses in-memory Qdrant instance with deterministic fast embeddings.
"""
import pytest
from unittest.mock import patch
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import videomind.vectordb.store as store
from videomind.vectordb.store import index_chunk, search_chunks, COLLECTION_NAME


def dummy_embedding(text: str):
    """Deterministic 384-dim embedding from text length and hash for fast testing."""
    val = (hash(text) % 1000) / 1000.0
    return [val] * 384


@pytest.fixture(autouse=True)
def setup_in_memory_qdrant():
    """Configure clean in-memory Qdrant collection for each test."""
    client = QdrantClient(":memory:")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )
    store._qdrant_client = client
    with patch("videomind.vectordb.store.get_embedding", side_effect=dummy_embedding):
        yield client
    store._qdrant_client = None


def test_index_and_search_single_chunk():
    index_chunk(
        video_id="video_abc",
        chunk_id="chunk_001",
        start_s=0.0,
        end_s=30.0,
        text="The quarterly financial report shows positive growth and strong revenue.",
        extra_payload={"source": "transcript"}
    )

    results = search_chunks(query="financial revenue growth", video_ids=["video_abc"], top_k=3)
    assert len(results) == 1
    assert results[0]["video_id"] == "video_abc"
    assert results[0]["chunk_id"] == "chunk_001"
    assert results[0]["start_s"] == 0.0
    assert results[0]["end_s"] == 30.0
    assert "revenue" in results[0]["text"]


def test_search_filters_by_video_id():
    index_chunk(
        video_id="video_1",
        chunk_id="c1",
        start_s=0.0,
        end_s=10.0,
        text="Machine learning model architecture and neural networks."
    )
    index_chunk(
        video_id="video_2",
        chunk_id="c2",
        start_s=0.0,
        end_s=10.0,
        text="Machine learning model training pipeline and dataset."
    )

    # Search specifically in video_1 only
    results = search_chunks(query="neural networks", video_ids=["video_1"], top_k=5)
    assert len(results) == 1
    assert results[0]["video_id"] == "video_1"

    # Search in both videos
    results_all = search_chunks(query="machine learning", video_ids=["video_1", "video_2"], top_k=5)
    assert len(results_all) == 2
    video_ids = {r["video_id"] for r in results_all}
    assert video_ids == {"video_1", "video_2"}
