import os
import sys
import uvicorn
from pathlib import Path
from dotenv import load_dotenv

# Ensure utf-8 stdout on Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add core to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Load .env if present
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8077"))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"Starting ClipScout Core on http://{host}:{port}")
    uvicorn.run(
        "videomind.api.app:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )
