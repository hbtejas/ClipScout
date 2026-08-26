from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from videomind.vectordb.store import search_chunks
from videomind.config import settings

router = APIRouter(tags=["Search & Ask"])

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    video_ids: Optional[List[str]] = None

class AskRequest(BaseModel):
    question: str
    video_ids: Optional[List[str]] = None

def format_timestamp(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m}:{s:02d}"

@router.post("/videos/{id}/search")
async def search_single_video(id: str, req: SearchRequest):
    hits = search_chunks(query=req.query, video_ids=[id], top_k=req.top_k or 5)
    for hit in hits:
        hit["formatted_start"] = format_timestamp(hit["start_s"])
        hit["formatted_end"] = format_timestamp(hit["end_s"])
    return {
        "video_id": id,
        "query": req.query,
        "results": hits,
        "count": len(hits)
    }

@router.post("/search")
async def search_multi_videos(req: SearchRequest):
    hits = search_chunks(query=req.query, video_ids=req.video_ids, top_k=req.top_k or 5)
    for hit in hits:
        hit["formatted_start"] = format_timestamp(hit["start_s"])
        hit["formatted_end"] = format_timestamp(hit["end_s"])
    return {
        "query": req.query,
        "results": hits,
        "count": len(hits)
    }

@router.post("/videos/{id}/ask")
async def ask_single_video(id: str, req: AskRequest):
    return await ask_multi_videos(AskRequest(question=req.question, video_ids=[id]))

@router.post("/ask")
async def ask_multi_videos(req: AskRequest):
    from videomind.aggregators.base import load_all_aggregates

    # 1. Check if question is an overview/summary query or entity query
    q_lower = req.question.lower()
    is_overview_query = any(k in q_lower for k in ("summarize", "summary", "overview", "what is this video about", "outline", "chapters"))
    is_entity_query = any(k in q_lower for k in ("who is", "who are", "people", "characters", "actors", "speakers"))

    evidence_blocks = []
    source_moments = []

    # Pull aggregates if video_ids provided
    if req.video_ids:
        for vid in req.video_ids:
            aggregates = load_all_aggregates(vid)
            if is_overview_query and "summary" in aggregates:
                summary_data = aggregates["summary"]
                evidence_blocks.append(f"[Video {vid} Executive Summary]: {summary_data.get('overview', '')}")
            if is_overview_query and "chapters" in aggregates:
                chaps = aggregates["chapters"].get("chapters", [])
                chap_lines = [f"  - {c.get('title')} ({format_timestamp(c.get('start_s', 0))} - {format_timestamp(c.get('end_s', 0))})" for c in chaps[:8]]
                if chap_lines:
                    evidence_blocks.append(f"[Video {vid} Chapters Timeline]:\n" + "\n".join(chap_lines))
            if is_entity_query and "entities" in aggregates:
                ent_data = aggregates["entities"]
                evidence_blocks.append(f"[Video {vid} Tracked Entities]: {ent_data}")

    # 2. Retrieve top relevant chunks as granular evidence
    hits = search_chunks(query=req.question, video_ids=req.video_ids, top_k=6)
    
    for hit in hits:
        start_fmt = format_timestamp(hit["start_s"])
        end_fmt = format_timestamp(hit["end_s"])
        source_moments.append({
            "video_id": hit["video_id"],
            "chunk_id": hit["chunk_id"],
            "start_s": hit["start_s"],
            "end_s": hit["end_s"],
            "label": f"[{start_fmt} - {end_fmt}] {hit['text'][:60]}..."
        })
        evidence_blocks.append(
            f"- Video {hit['video_id']} ({start_fmt} - {end_fmt}): {hit['text']}"
        )
    
    if not evidence_blocks:
        return {
            "question": req.question,
            "answer": "I could not find any matching video moments for your question.",
            "source_moments": []
        }

    evidence_text = "\n\n".join(evidence_blocks)

    # 3. Synthesize grounded answer if LLM key is available
    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = f"""You are an intelligent Video Assistant. Answer the user's question based strictly on the retrieved video evidence below.
Always cite specific timestamps in m:ss format whenever referencing video moments.
Do not invent information that isn't supported by the evidence.

Video Evidence:
{evidence_text}

User Question:
{req.question}
"""
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful, concise video analysis assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            answer = response.choices[0].message.content or ""
        except Exception as e:
            answer = f"Evidence gathered from video moments:\n\n{evidence_text}"
    else:
        # Fallback without OpenAI API key
        answer = f"Based on retrieved video segments:\n\n{evidence_text}"

    return {
        "question": req.question,
        "answer": answer,
        "source_moments": source_moments
    }
