# ClipScout — Conversational Video RAG Application

**ClipScout** is a full-stack, multimodal **Conversational Video Retrieval-Augmented Generation (Video RAG)** platform inspired by [FalconVQA](https://falconvqa.vercel.app/). It splits video footage into structured segments, runs audio-visual analysis (speech transcription, visual scene description, OCR, object and entity detection), stores dense embeddings in a local vector database, and allows users to chat with an AI agent that returns **grounded answers citing exact `m:ss` timestamps with playable video clips inline**.

---

## 1. System Architecture & How It Works

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (Next.js 14)                                │
│                                                                                        │
│  • Landing Page (FalconVQA high-tech UI)       • Workspace Dashboard                   │
│  • Supabase Auth (/login, /signup, /callback)  • Direct Semantic Moment Search         │
│  • AI Agent Chat Panel (/api/agent)            • Interactive Clip Artifact Player      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP API Calls (Tools)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE PROCESSING ENGINE (FastAPI)                          │
│                                                                                        │
│  1. Ingestion: POST /videos (local file upload, URL fetch, yt-dlp, content hashing)    │
│  2. Boundary & Chunking: Fixed-interval (30s) or Signal-fused scene chunking           │
│  3. Multimodal Analyzers:                                                              │
│     - transcript: Whisper Speech-to-Text via FFmpeg 16kHz mono audio extraction        │
│     - default_video: Visual Scene & Action Descriptions (OpenAI VLM)                   │
│     - people: Character, Speaker & Appearance Tagging (VLM)                            │
│     - object_detection: YOLO Gate + VLM Verification                                   │
│     - ocr: EasyOCR Gate + Text Extraction                                              │
│     - diarization: Speaker turns & audio attribution (PyAnnote Audio)                  │
│  4. Vector Store & Embeddings:                                                         │
│     - BAAI/bge-small-en-v1.5 dense sentence embeddings (384-dimensional)               │
│     - Embedded Qdrant collection ('videomind_chunks') with video_id filtering          │
│  5. Hierarchical Aggregators:                                                          │
│     - summary: Whole-video takeaway and executive overview                             │
│     - chapters: Timestamped chapters timeline                                          │
│     - entities: Cross-chunk tracked people, objects, and topics                        │
│     - novelty: High-novelty and outlier scene flags                                    │
│  6. Grounded Retrieval & Answer Synthesis:                                             │
│     - /videos/{id}/search & /search: Fast vector similarity moments                    │
│     - /videos/{id}/ask & /ask: Dynamic question routing with timestamp citations       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. All Core Functions & API Endpoints

### A. Video Ingestion & Lifecycle
| Endpoint | Method | Function / Description |
| :--- | :--- | :--- |
| `/videos` | `POST` | Uploads a video file or provides a remote URL. Computes content hash, chunks the video, triggers background multimodal analysis, indexes vectors, and generates aggregations. |
| `/videos/{id}` | `GET` | Returns real-time processing status (`queued`, `analyzing`, `ready`, `failed`), active analysis stage, progress percentage, and chunk metadata. |
| `/videos/{id}/transcript` | `GET` | Returns full video transcript and individual timestamped segments (`[{start, end, text}]`). |

### B. Search & Grounded Question Answering
| Endpoint | Method | Function / Description |
| :--- | :--- | :--- |
| `/videos/{id}/search` | `POST` | Runs dense vector similarity search against chunks of a specific video in Qdrant; returns top matching moments with `formatted_start` and `formatted_end`. |
| `/search` | `POST` | Multi-video vector search across all or tagged `video_ids[]`. |
| `/videos/{id}/ask` | `POST` | Grounded question answering over a single video; cites exact `m:ss` timestamps and returns `source_moments`. |
| `/ask` | `POST` | Multi-video grounded question answering with dynamic routing (pulling summaries, chapters, and entity timelines alongside vector hits). |

### C. Aggregated Insights & Metadata
| Endpoint | Method | Function / Description |
| :--- | :--- | :--- |
| `/videos/{id}/insights` | `GET` | Returns pre-computed video aggregations (`summary`, `chapters`, `entities`, `novelty`). |
| `/videos/{id}/entities` | `GET` | Returns cross-chunk entity timeline and appearances. |
| `/analyzers` | `GET` | Lists all registered multimodal analyzers, their requirements (`audio`, `frames`), and availability. |
| `/health` | `GET` | System health check reporting FFmpeg resolution, storage paths, and Qdrant readiness. |

---

## 3. Frontend Architecture & Agent Tools

The frontend is built on **Next.js 14 App Router** with **AI SDK** tool-calling:

### AI Agent Tools (`frontend/lib/agent/tools.ts`)
1. `ask_video`: Calls `/ask` to get a grounded answer with timestamp citations.
2. `search_moments`: Calls `/search` to retrieve timestamped moments matching a query.
3. `show_clips`: Surfaces structured video clips into the interactive **Clip Artifact Side Panel**.
4. `get_video_transcript`: Retrieves full transcripts and timestamped segments.
5. `get_video_insights`: Retrieves executive summaries and chapter timelines.
6. `get_video_entities`: Retrieves tracked people, objects, and key entities.

---

## 4. Supabase Database & Auth Layer

- **Database Tables**:
  - `projects`: Workspace containers owned by `user_id`.
  - `videos`: Videos linked to projects and tracked against `core_video_id`.
  - `conversations`: Chat sessions scoped to projects and tagged `video_ids[]`.
  - `messages`: Chat message history with JSON tool calls and results.
- **Row Level Security (RLS)**: Enforces strict data ownership via `auth.uid() = user_id`.
- **Storage Buckets**:
  - `videos` (public): Raw video files accessible by public URL for backend ingest.
  - `project-assets` (private): User assets and thumbnails.

*See [`PROMPT_TO_SETUP_SUPABASE.md`](file:///d:/ClipScout/PROMPT_TO_SETUP_SUPABASE.md) for the complete one-click SQL migration script.*

---

## 5. Quick Start Guide

### Step 1: Start Core Processing Engine
```bash
cd core
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

python serve.py
```
- **Core API URL**: `http://127.0.0.1:8077`
- **Swagger Docs**: `http://127.0.0.1:8077/docs`
- **Dev Test Web UI**: `http://127.0.0.1:8077/`

### Step 2: Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
- **Web App URL**: `http://localhost:3000`

---

## 6. Environment Variables

### `frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

CORE_API_URL=http://127.0.0.1:8077
NEXT_PUBLIC_CORE_API_URL=http://127.0.0.1:8077

OPENAI_API_KEY=your_openai_key
```

### `core/.env`
```env
PORT=8077
HOST=127.0.0.1
VIDEOMIND_CACHE=data/cache
QDRANT_PATH=data/qdrant
VIDEOMIND_BUCKET=videos

OPENAI_API_KEY=your_openai_key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
