import base64
import json
from typing import Optional, Dict, Any, List
from pathlib import Path
from videomind.config import settings

def encode_image_base64(image_path: str | Path) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

async def call_vlm_json(
    prompt: str,
    image_paths: List[str | Path],
    schema: Optional[Dict[str, Any]] = None,
    model: str = "gpt-4o"
) -> Dict[str, Any]:
    """Call Vision Language Model API for structured JSON reasoning."""
    if not settings.OPENAI_API_KEY:
        return {"error": "OPENAI_API_KEY not configured"}
    
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]
        for p in image_paths:
            b64 = encode_image_base64(p)
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
            })
        
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert video analyst. Analyze the provided frame(s) accurately and return only valid JSON matching the requested structure."
                },
                {"role": "user", "content": content}
            ],
            response_format={"type": "json_object"}
        )
        
        res_text = response.choices[0].message.content or "{}"
        return json.loads(res_text)
    except Exception as e:
        return {"error": str(e)}
