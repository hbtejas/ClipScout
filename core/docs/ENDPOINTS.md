# Core API Endpoints

All endpoints are hosted at `http://127.0.0.1:8077` by default.

## Video Processing & Ingestion

### `POST /videos`
Accepts a video file upload (multipart/form-data) OR a JSON payload `{ "url": "..." }`.
- **Response**: `{ "video_id": "...", "status": "queued", "message": "..." }`

### `GET /videos/{id}`
Returns the current job status, pipeline stage, and metadata for a video.
- **Stages**: `queued` → `analyzing (chunking)` → `analyzing (transcribing)` → `analyzing (embedding)` → `ready` (or `failed`)

### `GET /videos/{id}/transcript`
Returns the complete timestamped transcript segments for a video.

### `GET /videos/{id}/chunks/{chunk_id}`
Returns all stored analyzer outputs for a single chunk.

## Search & Question Answering

### `POST /videos/{id}/search`
Vector similarity search over chunks in a single video.
- **Body**: `{ "query": "string", "top_k": 5 }`
- **Response**: `{ "video_id": "...", "query": "...", "results": [{ "chunk_id": "...", "start_s": 0.0, "end_s": 30.0, "text": "...", "score": 0.85 }] }`

### `POST /search`
Vector similarity search across multiple tagged videos.
- **Body**: `{ "query": "string", "video_ids": ["id1", "id2"], "top_k": 5 }`

### `POST /videos/{id}/ask` & `POST /ask`
Grounded question answering synthesizing an evidence-backed answer with timestamp citations (`m:ss`).
- **Body**: `{ "question": "string", "video_ids": ["..."] }`
- **Response**: `{ "question": "...", "answer": "...", "source_moments": [{ "video_id": "...", "start_s": ..., "end_s": ..., "label": "..." }] }`

## Insights & Aggregates

### `GET /videos/{id}/insights`
Returns whole-video summary, chapter segmentation, and novelty scores.

### `GET /videos/{id}/entities`
Returns recognized and tracked entities (people, objects) across video chunks.

## System & Metadata

### `GET /analyzers`
Returns the list of loaded analyzers and their operational status.

### `GET /health`
Returns system status (`ok` / `degraded`), storage readiness, and FFmpeg availability.
