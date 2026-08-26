/**
 * Unit tests for lib/data/videos.ts
 * All Supabase calls are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}));

function makeChain(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    ...overrides,
  };
}

import {
  listVideos,
  getVideo,
  getVideoByCoreId,
  createVideoRecord,
  updateVideoStatus,
} from '@/lib/data/videos';

describe('listVideos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns list on success', async () => {
    const videos = [{ id: 'v1', title: 'Test', project_id: 'p1' }];
    const chain = makeChain({ order: vi.fn().mockResolvedValue({ data: videos, error: null }) });
    mockFrom.mockReturnValue(chain);

    const result = await listVideos('p1');
    expect(result).toEqual(videos);
  });

  it('returns empty array when data is null', async () => {
    const chain = makeChain({ order: vi.fn().mockResolvedValue({ data: null, error: null }) });
    mockFrom.mockReturnValue(chain);

    expect(await listVideos('p1')).toEqual([]);
  });

  it('throws on error', async () => {
    const chain = makeChain({ order: vi.fn().mockResolvedValue({ data: null, error: new Error('fail') }) });
    mockFrom.mockReturnValue(chain);

    await expect(listVideos('p1')).rejects.toThrow('fail');
  });

  it('filters by project_id', async () => {
    const chain = makeChain({ order: vi.fn().mockResolvedValue({ data: [], error: null }) });
    const eqSpy = vi.fn().mockReturnValue(chain);
    mockFrom.mockReturnValue({ ...chain, eq: eqSpy });

    await listVideos('project-xyz');
    expect(eqSpy).toHaveBeenCalledWith('project_id', 'project-xyz');
  });
});

describe('getVideo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns video when found', async () => {
    const video = { id: 'v1', title: 'Test' };
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: video, error: null }) });
    mockFrom.mockReturnValue(chain);

    expect(await getVideo('v1')).toEqual(video);
  });

  it('returns null on error (not found)', async () => {
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) });
    mockFrom.mockReturnValue(chain);

    expect(await getVideo('bad-id')).toBeNull();
  });
});

describe('getVideoByCoreId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when not found', async () => {
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }) });
    mockFrom.mockReturnValue(chain);

    expect(await getVideoByCoreId('core-999')).toBeNull();
  });

  it('returns video when found', async () => {
    const video = { id: 'v2', core_video_id: 'core-42' };
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: video, error: null }) });
    mockFrom.mockReturnValue(chain);

    expect(await getVideoByCoreId('core-42')).toEqual(video);
  });
});

describe('createVideoRecord', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates with status=queued by default', async () => {
    const created = { id: 'v3', status: 'queued' };
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: created, error: null }) });
    const insertSpy = vi.fn().mockReturnValue(chain);
    mockFrom.mockReturnValue({ ...chain, insert: insertSpy });

    const result = await createVideoRecord({
      project_id: 'p1',
      title: 'New Video',
      source_type: 'url',
      source_url: 'https://example.com/video.mp4',
    });

    expect(result.status).toBe('queued');
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'queued', analysis_stage: 'chunking' })
    );
  });

  it('throws on insert error', async () => {
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: null, error: new Error('insert fail') }) });
    mockFrom.mockReturnValue({ ...chain, insert: vi.fn().mockReturnValue(chain) });

    await expect(createVideoRecord({
      project_id: 'p1', title: 'T', source_type: 'upload', source_url: 's3://...',
    })).rejects.toThrow('insert fail');
  });
});

describe('updateVideoStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns updated video on success', async () => {
    const updated = { id: 'v1', status: 'ready' };
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: updated, error: null }) });
    mockFrom.mockReturnValue({ ...chain, update: vi.fn().mockReturnValue(chain) });

    const result = await updateVideoStatus('v1', { status: 'ready' });
    expect(result.status).toBe('ready');
  });

  it('throws on update error', async () => {
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: null, error: new Error('update fail') }) });
    mockFrom.mockReturnValue({ ...chain, update: vi.fn().mockReturnValue(chain) });

    await expect(updateVideoStatus('v1', { status: 'failed' })).rejects.toThrow('update fail');
  });
});
