import { z } from 'zod';
import { tool } from 'ai';
import { coreClient } from '@/lib/core-client';

export const agentTools = {
  ask_video: tool({
    description: 'Answer a question about one or more indexed videos, grounded in multimodal evidence with timestamp citations.',
    parameters: z.object({
      question: z.string().describe('The user question or inquiry about the video content'),
      video_ids: z.array(z.string()).optional().describe('Optional list of video IDs to restrict query scope'),
    }),
    execute: async ({ question, video_ids }) => {
      return await coreClient.ask({ question, video_ids });
    },
  }),

  search_moments: tool({
    description: 'Find specific timestamped video moments matching a semantic description or keyword query.',
    parameters: z.object({
      query: z.string().describe('The search query for transcript or visual events'),
      video_ids: z.array(z.string()).optional().describe('Optional list of video IDs to search'),
      top_k: z.number().optional().describe('Maximum number of matching moments to return'),
    }),
    execute: async ({ query, video_ids, top_k }) => {
      return await coreClient.search({ query, video_ids, top_k });
    },
  }),

  show_clips: tool({
    description: 'Open the clip artifact panel in the UI with a specific set of timestamped video clips for the user to watch.',
    parameters: z.object({
      clips: z.array(
        z.object({
          video_id: z.string(),
          start_s: z.number(),
          end_s: z.number(),
          label: z.string().optional(),
        })
      ),
    }),
    execute: async ({ clips }) => {
      // Returns clip payload for frontend UI side panel rendering
      return { clips, opened: true };
    },
  }),

  get_video_transcript: tool({
    description: 'Retrieve the complete timestamped transcript segments of a specific video.',
    parameters: z.object({
      video_id: z.string().describe('The video ID to retrieve transcript for'),
    }),
    execute: async ({ video_id }) => {
      return await coreClient.getTranscript(video_id);
    },
  }),

  get_video_insights: tool({
    description: 'Retrieve high-level insights, executive summary, chapters, and novelty analysis of a video.',
    parameters: z.object({
      video_id: z.string().describe('The video ID to fetch insights for'),
    }),
    execute: async ({ video_id }) => {
      return await coreClient.getInsights(video_id);
    },
  }),

  get_video_entities: tool({
    description: 'Retrieve tracked people, objects, and topics across video chunks.',
    parameters: z.object({
      video_id: z.string().describe('The video ID to fetch entities for'),
    }),
    execute: async ({ video_id }) => {
      return await coreClient.getEntities(video_id);
    },
  }),
};
