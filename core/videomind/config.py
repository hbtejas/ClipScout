from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # API Keys & Auth
    OPENAI_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None

    # Supabase (optional for standalone local mode)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    VIDEOMIND_BUCKET: str = "videos"

    # Processing & Ingestion
    VIDEOMIND_MAX_BYTES: int = 4 * 1024 * 1024 * 1024  # 4 GiB
    VIDEOMIND_CACHE: str = "data/cache"
    VIDEOMIND_FFMPEG: Optional[str] = None
    VIDEOMIND_YT_MAX_DURATION: int = 3600
    VIDEOMIND_YT_COOKIES: Optional[str] = None
    VIDEOMIND_YT_COOKIES_FROM_BROWSER: Optional[str] = None

    # Storage
    QDRANT_PATH: str = "data/qdrant"

    # Models & Defaults
    DEFAULT_WHISPER_MODEL: str = "base"
    DEFAULT_EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    DEFAULT_CHUNK_INTERVAL_SECONDS: float = 30.0

settings = Settings()
