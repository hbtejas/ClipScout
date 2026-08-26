import os
import shutil
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from videomind.config import settings
from videomind.paths import get_cache_dir, get_qdrant_path
from videomind.analyzers import get_available_analyzers_meta
from videomind.api.routes_videos import router as videos_router
from videomind.api.routes_search import router as search_router
from videomind.api.routes_insights import router as insights_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="ClipScout VideoMind Core API",
        description="Multimodal processing, chunking, transcription, indexing, and search engine for video RAG",
        version="0.1.0"
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include Routers
    app.include_router(videos_router)
    app.include_router(search_router)
    app.include_router(insights_router)

    @app.get("/analyzers", tags=["Meta"])
    async def list_analyzers():
        """List all available video analyzers and their system status."""
        return {
            "analyzers": get_available_analyzers_meta()
        }

    @app.get("/health", tags=["Meta"])
    async def health_check():
        """Check status of storage, ffmpeg, and analyzers."""
        # Check ffmpeg
        ffmpeg_ok = False
        try:
            from videomind.extractors.audio import get_ffmpeg_binary
            get_ffmpeg_binary()
            ffmpeg_ok = True
        except Exception:
            pass

        # Check storage paths
        cache_ok = get_cache_dir().exists()
        qdrant_ok = get_qdrant_path().exists()

        analyzers = get_available_analyzers_meta()
        
        status = "ok" if (ffmpeg_ok and cache_ok and qdrant_ok) else "degraded"

        return {
            "status": status,
            "ffmpeg": ffmpeg_ok,
            "storage": {
                "cache_dir": str(get_cache_dir()),
                "qdrant_path": str(get_qdrant_path()),
                "cache_ready": cache_ok,
                "qdrant_ready": qdrant_ok
            },
            "analyzers": analyzers,
            "version": "0.1.0"
        }

    # Built-in developer test UI
    webui_path = Path(__file__).resolve().parent / "webui" / "index.html"
    @app.get("/", response_class=HTMLResponse, tags=["WebUI"])
    async def serve_webui():
        if webui_path.exists():
            return FileResponse(webui_path)
        return "<h1>ClipScout Core API is running. Visit /docs for Swagger UI.</h1>"

    return app

app = create_app()
