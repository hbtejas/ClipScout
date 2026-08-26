import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { agentTools } from '@/lib/agent/tools';
import { AGENT_SYSTEM_PROMPT } from '@/lib/agent/system-prompt';
import { coreClient } from '@/lib/core-client';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, video_ids } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Direct real-time grounded fallback via Core API /ask endpoint
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
      const questionText = lastUserMsg?.content || 'Summarize the video';

      try {
        const coreAnswer = await coreClient.ask({
          question: questionText,
          video_ids: video_ids && video_ids.length > 0 ? video_ids : undefined,
        });

        // Format direct streamed-like text response
        const answerText = coreAnswer.answer || 'No video moments found.';
        return new Response(`0:"${answerText.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Vercel-AI-Data-Stream': 'v1',
          },
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message || 'Failed to query video database' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Full multi-tool AI Agent with OpenAI SDK
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `${AGENT_SYSTEM_PROMPT}\nActive scoped video IDs for this conversation: ${JSON.stringify(video_ids || [])}`,
      messages,
      tools: agentTools,
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Agent error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
