import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue, MatchAny
from videomind.paths import get_qdrant_path
from videomind.vectordb.embed import get_embedding, EMBEDDING_DIM

COLLECTION_NAME = "videomind_chunks"
_qdrant_client: Optional[QdrantClient] = None

def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        q_path = str(get_qdrant_path())
        _qdrant_client = QdrantClient(path=q_path)
        # Ensure collection exists
        collections = _qdrant_client.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        if not exists:
            _qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE)
            )
    return _qdrant_client

def index_chunk(
    video_id: str,
    chunk_id: str,
    start_s: float,
    end_s: float,
    text: str,
    extra_payload: Optional[Dict[str, Any]] = None
) -> None:
    client = get_qdrant_client()
    embedding = get_embedding(text)
    
    # Deterministic point ID from video_id and chunk_id
    point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{video_id}_{chunk_id}"))
    
    payload = {
        "video_id": video_id,
        "chunk_id": chunk_id,
        "start_s": start_s,
        "end_s": end_s,
        "text": text,
        **(extra_payload or {})
    }
    
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload
            )
        ]
    )

def search_chunks(
    query: str,
    video_ids: Optional[List[str]] = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    client = get_qdrant_client()
    query_vector = get_embedding(query)
    
    query_filter: Optional[Filter] = None
    if video_ids and len(video_ids) == 1:
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="video_id",
                    match=MatchValue(value=video_ids[0])
                )
            ]
        )
    elif video_ids and len(video_ids) > 1:
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="video_id",
                    match=MatchAny(any=video_ids)
                )
            ]
        )
        
    try:
        # Use query_points or search
        if hasattr(client, "query_points"):
            response = client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                query_filter=query_filter,
                limit=top_k
            )
            hits = response.points
        else:
            hits = client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                query_filter=query_filter,
                limit=top_k
            )
            
        results = []
        for hit in hits:
            payload = hit.payload or {}
            results.append({
                "video_id": payload.get("video_id"),
                "chunk_id": payload.get("chunk_id"),
                "start_s": payload.get("start_s", 0.0),
                "end_s": payload.get("end_s", 0.0),
                "text": payload.get("text", ""),
                "score": round(float(hit.score), 4) if hasattr(hit, "score") else 1.0,
                "extra": {k: v for k, v in payload.items() if k not in ("video_id", "chunk_id", "start_s", "end_s", "text")}
            })
        return results
    except Exception as e:
        print(f"Error executing vector search: {e}")
        return []
