import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { agentTools } from '@/lib/agent/tools';
import { AGENT_SYSTEM_PROMPT } from '@/lib/agent/system-prompt';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, video_ids } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback message if OpenAI key is not configured in frontend .env
      return new Response(
        JSON.stringify({
          error: "OPENAI_API_KEY is not configured in frontend/.env.local. Please set your key to chat with the agent."
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
