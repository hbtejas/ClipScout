from typing import List, Optional, Any
from videomind.config import settings

_embed_model: Optional[Any] = None
EMBEDDING_DIM = 384  # Default for bge-small / all-MiniLM-L6-v2

def get_embedding_model():
    global _embed_model
    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        model_name = settings.DEFAULT_EMBEDDING_MODEL
        try:
            _embed_model = SentenceTransformer(model_name)
        except Exception:
            # Fallback to standard fast sentence transformer
            _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embed_model

def get_embedding(text: str) -> List[float]:
    if not text.strip():
        return [0.0] * EMBEDDING_DIM
    model = get_embedding_model()
    emb = model.encode(text, normalize_embeddings=True)
    return emb.tolist()

def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    cleaned = [t if t.strip() else "empty" for t in texts]
    model = get_embedding_model()
    embs = model.encode(cleaned, normalize_embeddings=True)
    return embs.tolist()
