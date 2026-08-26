/**
 * Unit tests for lib/data/projects.ts
 * Supabase client is fully mocked — no network calls.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Supabase mock ──────────────────────────────────────────────────────────────
const mockFrom = vi.fn();
const mockAuth = {
  getUser: vi.fn(),
};
const mockSupabase = {
  from: mockFrom,
  auth: mockAuth,
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    ...overrides,
  };
  return chain;
}

import { listProjects, getProject, createProject, deleteProject } from '@/lib/data/projects';

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('listProjects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns array of projects on success', async () => {
    const projects = [
      { id: 'p1', name: 'Project A', user_id: 'u1', created_at: '2024-01-01' },
    ];
    const chain = makeChain({ order: vi.fn().mockResolvedValue({ data: projects, error: null }) });
    mockFrom.mockReturnValue(chain);

    const result = await listProjects();
    expect(result).toEqual(projects);
    expect(mockFrom).toHaveBeenCalledWith('projects');
  });

  it('returns empty array when data is null', async () => {
    const chain = makeChain({ order: vi.fn().mockResolvedValue({ data: null, error: null }) });
    mockFrom.mockReturnValue(chain);

    const result = await listProjects();
    expect(result).toEqual([]);
  });

  it('throws on Supabase error', async () => {
    const chain = makeChain({
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    });
    mockFrom.mockReturnValue(chain);

    await expect(listProjects()).rejects.toThrow('DB error');
  });
});

describe('getProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a project when found', async () => {
    const project = { id: 'p1', name: 'Proj A', user_id: 'u1' };
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: project, error: null }) });
    mockFrom.mockReturnValue(chain);

    const result = await getProject('p1');
    expect(result).toEqual(project);
  });

  it('returns null when Supabase returns error (not found)', async () => {
    const chain = makeChain({
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    });
    mockFrom.mockReturnValue(chain);

    const result = await getProject('nonexistent');
    expect(result).toBeNull();
  });
});

describe('createProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns new project on success', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const created = { id: 'pnew', name: 'New Project', user_id: 'u1' };
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: created, error: null }) });
    mockFrom.mockReturnValue(chain);

    const result = await createProject({ name: 'New Project' });
    expect(result).toEqual(created);
  });

  it('throws when not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } });
    await expect(createProject({ name: 'Test' })).rejects.toThrow('Not authenticated');
  });

  it('throws on insert error', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const chain = makeChain({
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('insert failed') }),
    });
    mockFrom.mockReturnValue(chain);

    await expect(createProject({ name: 'Bad' })).rejects.toThrow('insert failed');
  });

  it('passes description as null when undefined', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const chain = makeChain({ single: vi.fn().mockResolvedValue({ data: { id: 'px' }, error: null }) });
    const insertSpy = vi.fn().mockReturnValue(chain);
    mockFrom.mockReturnValue({ ...chain, insert: insertSpy });

    await createProject({ name: 'Nodesc' });
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ description: null })
    );
  });
});

describe('deleteProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves without error on success', async () => {
    const chain = makeChain({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockFrom.mockReturnValue(chain);

    await expect(deleteProject('p1')).resolves.toBeUndefined();
  });

  it('throws on delete error', async () => {
    const chain = makeChain({
      eq: vi.fn().mockResolvedValue({ error: new Error('delete failed') }),
    });
    mockFrom.mockReturnValue(chain);

    await expect(deleteProject('p1')).rejects.toThrow('delete failed');
  });
});
