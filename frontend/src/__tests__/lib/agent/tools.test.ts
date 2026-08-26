/**
 * Unit tests for lib/agent/tools.ts
 * All coreClient calls are mocked — tests verify correct parameter passing
 * and response shaping for each tool.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as coreClientModule from '@/lib/core-client';

// Use module-level factory to avoid hoisting issues
vi.mock('@/lib/core-client', () => ({
  coreClient: {
    ask: vi.fn(),
    search: vi.fn(),
    getTranscript: vi.fn(),
    getInsights: vi.fn(),
    getEntities: vi.fn(),
  },
}));

import { agentTools } from '@/lib/agent/tools';

// Typed references to the mocked functions
const mockCoreClient = (coreClientModule.coreClient as unknown) as {
  ask: ReturnType<typeof vi.fn>;
  search: ReturnType<typeof vi.fn>;
  getTranscript: ReturnType<typeof vi.fn>;
  getInsights: ReturnType<typeof vi.fn>;
  getEntities: ReturnType<typeof vi.fn>;
};

describe('agentTools.ask_video', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls coreClient.ask with question and video_ids', async () => {
    const mockResponse = {
      question: 'What is this about?',
      answer: 'A test video about AI.',
      source_moments: [{ video_id: 'v1', start_s: 10, end_s: 40, chunk_id: 'v1_c000', label: '0:10-0:40' }],
    };
    mockCoreClient.ask.mockResolvedValue(mockResponse);

    const result = await agentTools.ask_video.execute!(
      { question: 'What is this about?', video_ids: ['v1'] },
      { toolCallId: 'tc1', messages: [] }
    );

    expect(mockCoreClient.ask).toHaveBeenCalledWith({ question: 'What is this about?', video_ids: ['v1'] });
    expect(result).toEqual(mockResponse);
  });

  it('calls coreClient.ask without video_ids when undefined', async () => {
    mockCoreClient.ask.mockResolvedValue({ question: 'q', answer: 'a', source_moments: [] });

    await agentTools.ask_video.execute!(
      { question: 'summarize this video' },
      { toolCallId: 'tc2', messages: [] }
    );

    expect(mockCoreClient.ask).toHaveBeenCalledWith({ question: 'summarize this video', video_ids: undefined });
  });

  it('propagates errors from coreClient.ask', async () => {
    mockCoreClient.ask.mockRejectedValue(new Error('API down'));

    await expect(
      agentTools.ask_video.execute!(
        { question: 'test' },
        { toolCallId: 'tc3', messages: [] }
      )
    ).rejects.toThrow('API down');
  });

  it('has correct tool description', () => {
    expect(agentTools.ask_video.description).toContain('Answer a question');
  });
});

describe('agentTools.search_moments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls coreClient.search with correct params', async () => {
    const mockResponse = { results: [{ video_id: 'v1', start_s: 5, end_s: 30, text: 'hello', score: 0.9 }], count: 1, query: 'hello' };
    mockCoreClient.search.mockResolvedValue(mockResponse);

    const result = await agentTools.search_moments.execute!(
      { query: 'hello', video_ids: ['v1'], top_k: 5 },
      { toolCallId: 'tc1', messages: [] }
    );

    expect(mockCoreClient.search).toHaveBeenCalledWith({ query: 'hello', video_ids: ['v1'], top_k: 5 });
    expect(result).toEqual(mockResponse);
  });

  it('works without optional params', async () => {
    mockCoreClient.search.mockResolvedValue({ results: [], count: 0, query: 'x' });

    await agentTools.search_moments.execute!(
      { query: 'x' },
      { toolCallId: 'tc2', messages: [] }
    );

    expect(mockCoreClient.search).toHaveBeenCalledWith({ query: 'x', video_ids: undefined, top_k: undefined });
  });
});

describe('agentTools.show_clips', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns clips payload with opened=true', async () => {
    const clips = [
      { video_id: 'v1', start_s: 10, end_s: 40, label: 'Scene 1' },
      { video_id: 'v1', start_s: 60, end_s: 90 },
    ];

    const result = await agentTools.show_clips.execute!(
      { clips },
      { toolCallId: 'tc1', messages: [] }
    );

    expect(result).toEqual({ clips, opened: true });
  });

  it('works with empty clips array', async () => {
    const result = await agentTools.show_clips.execute!(
      { clips: [] },
      { toolCallId: 'tc2', messages: [] }
    );
    expect(result.opened).toBe(true);
    expect(result.clips).toEqual([]);
  });

  it('does NOT call any external API (pure data passthrough)', async () => {
    await agentTools.show_clips.execute!(
      { clips: [{ video_id: 'v1', start_s: 0, end_s: 10 }] },
      { toolCallId: 'tc3', messages: [] }
    );
    expect(mockCoreClient.ask).not.toHaveBeenCalled();
    expect(mockCoreClient.search).not.toHaveBeenCalled();
    expect(mockCoreClient.getTranscript).not.toHaveBeenCalled();
  });
});

describe('agentTools.get_video_transcript', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls coreClient.getTranscript with video_id', async () => {
    const mockTranscript = {
      video_id: 'v1', full_text: 'Hello world',
      segments: [{ start: 0, end: 5, text: 'Hello world' }], num_segments: 1,
    };
    mockCoreClient.getTranscript.mockResolvedValue(mockTranscript);

    const result = await agentTools.get_video_transcript.execute!(
      { video_id: 'v1' },
      { toolCallId: 'tc1', messages: [] }
    );

    expect(mockCoreClient.getTranscript).toHaveBeenCalledWith('v1');
    expect(result).toEqual(mockTranscript);
  });
});

describe('agentTools.get_video_insights', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls coreClient.getInsights with video_id', async () => {
    const mockInsights = { summary: { overview: 'great video' } };
    mockCoreClient.getInsights.mockResolvedValue(mockInsights);

    const result = await agentTools.get_video_insights.execute!(
      { video_id: 'v2' },
      { toolCallId: 'tc1', messages: [] }
    );

    expect(mockCoreClient.getInsights).toHaveBeenCalledWith('v2');
    expect(result).toEqual(mockInsights);
  });
});

describe('agentTools.get_video_entities', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls coreClient.getEntities with video_id', async () => {
    const mockEntities = { people: ['Alice'], objects: ['laptop'] };
    mockCoreClient.getEntities.mockResolvedValue(mockEntities);

    const result = await agentTools.get_video_entities.execute!(
      { video_id: 'v3' },
      { toolCallId: 'tc1', messages: [] }
    );

    expect(mockCoreClient.getEntities).toHaveBeenCalledWith('v3');
    expect(result).toEqual(mockEntities);
  });
});
