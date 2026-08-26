/**
 * Unit tests for lib/core-client.ts
 * Tests URL routing logic, error handling, and response shaping.
 * All fetch() calls are intercepted with global mock.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock types
vi.mock('@/types', () => ({
  // Allow the module to load without real type resolution
}));

import { CoreClient } from '@/lib/core-client';

const BASE = 'http://test-core:8077';

function mockFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });
}

function mockFetchError(status: number, body: unknown = { detail: 'error' }) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve(body),
    statusText: 'Error',
  });
}

describe('CoreClient URL routing', () => {
  let client: CoreClient;

  beforeEach(() => {
    client = new CoreClient(BASE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getHealth calls /health', async () => {
    const fetchMock = mockFetchOk({ status: 'ok', ffmpeg: true, analyzers: [] });
    vi.stubGlobal('fetch', fetchMock);

    await client.getHealth();
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/health`, expect.any(Object));
  });

  it('getAnalyzers calls /analyzers', async () => {
    const fetchMock = mockFetchOk({ analyzers: [] });
    vi.stubGlobal('fetch', fetchMock);

    await client.getAnalyzers();
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/analyzers`, expect.any(Object));
  });

  it('search with single video_id calls /videos/{id}/search', async () => {
    const fetchMock = mockFetchOk({ results: [], count: 0, query: 'x' });
    vi.stubGlobal('fetch', fetchMock);

    await client.search({ query: 'x', video_ids: ['vid1'] });
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toBe(`${BASE}/videos/vid1/search`);
  });

  it('search with multiple video_ids calls /search', async () => {
    const fetchMock = mockFetchOk({ results: [], count: 0, query: 'x' });
    vi.stubGlobal('fetch', fetchMock);

    await client.search({ query: 'x', video_ids: ['vid1', 'vid2'] });
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toBe(`${BASE}/search`);
  });

  it('search with no video_ids calls /search', async () => {
    const fetchMock = mockFetchOk({ results: [], count: 0, query: 'x' });
    vi.stubGlobal('fetch', fetchMock);

    await client.search({ query: 'x' });
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toBe(`${BASE}/search`);
  });

  it('ask with single video_id calls /videos/{id}/ask', async () => {
    const fetchMock = mockFetchOk({ answer: 'ok', question: 'q', source_moments: [] });
    vi.stubGlobal('fetch', fetchMock);

    await client.ask({ question: 'q', video_ids: ['v1'] });
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toBe(`${BASE}/videos/v1/ask`);
  });

  it('ask with no video_ids calls /ask', async () => {
    const fetchMock = mockFetchOk({ answer: 'ok', question: 'q', source_moments: [] });
    vi.stubGlobal('fetch', fetchMock);

    await client.ask({ question: 'q' });
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toBe(`${BASE}/ask`);
  });

  it('getTranscript calls /videos/{id}/transcript', async () => {
    const fetchMock = mockFetchOk({ video_id: 'v1', full_text: '', segments: [], num_segments: 0 });
    vi.stubGlobal('fetch', fetchMock);

    await client.getTranscript('v1');
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/videos/v1/transcript`);
  });

  it('getInsights calls /videos/{id}/insights', async () => {
    const fetchMock = mockFetchOk({});
    vi.stubGlobal('fetch', fetchMock);

    await client.getInsights('v1');
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/videos/v1/insights`);
  });
});

describe('CoreClient error handling', () => {
  let client: CoreClient;

  beforeEach(() => {
    client = new CoreClient(BASE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getHealth throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetchError(500));
    await expect(client.getHealth()).rejects.toThrow('Health check failed: HTTP 500');
  });

  it('ingestUrl throws with detail message on 400', async () => {
    vi.stubGlobal('fetch', mockFetchError(400, { detail: 'URL not supported' }));
    await expect(client.ingestUrl('https://bad.url')).rejects.toThrow('URL not supported');
  });

  it('search throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetchError(503));
    await expect(client.search({ query: 'x' })).rejects.toThrow('Search failed: HTTP 503');
  });

  it('search sends default top_k of 5 when not specified', async () => {
    const fetchMock = mockFetchOk({ results: [], count: 0, query: 'x' });
    vi.stubGlobal('fetch', fetchMock);

    await client.search({ query: 'x' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.top_k).toBe(5);
  });
});
