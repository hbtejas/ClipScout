import { AnalyzerMeta, SearchResultItem, SourceMoment } from '@/types';

const CORE_API_URL = process.env.CORE_API_URL || process.env.NEXT_PUBLIC_CORE_API_URL || 'http://127.0.0.1:8077';

export interface IngestResponse {
  video_id: string;
  status: string;
  message: string;
}

export interface VideoStatusResponse {
  video_id: string;
  status: 'queued' | 'analyzing' | 'ready' | 'failed';
  analysis_stage: string;
  progress: number;
  error_message?: string;
  analyzers_used: string[];
  chunking_mode: string;
  num_chunks: number;
  duration_seconds: number;
}

export interface TranscriptResponse {
  video_id: string;
  full_text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  num_segments: number;
}

export interface SearchResponse {
  video_id?: string;
  query: string;
  results: SearchResultItem[];
  count: number;
}

export interface AskResponse {
  question: string;
  answer: string;
  source_moments: SourceMoment[];
}

export class CoreClient {
  private baseUrl: string;

  constructor(baseUrl = CORE_API_URL) {
    this.baseUrl = baseUrl;
  }

  async getHealth(): Promise<{ status: string; ffmpeg: boolean; analyzers: AnalyzerMeta[] }> {
    const res = await fetch(`${this.baseUrl}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`);
    return res.json();
  }

  async getAnalyzers(): Promise<{ analyzers: AnalyzerMeta[] }> {
    const res = await fetch(`${this.baseUrl}/analyzers`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch analyzers failed: HTTP ${res.status}`);
    return res.json();
  }

  async ingestUrl(url: string, analyzers?: string[], chunking_mode = 'fixed_interval', interval_s = 30.0): Promise<IngestResponse> {
    const res = await fetch(`${this.baseUrl}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, analyzers, chunking_mode, interval_s }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Ingestion failed');
    }
    return res.json();
  }

  async ingestFile(formData: FormData): Promise<IngestResponse> {
    const res = await fetch(`${this.baseUrl}/videos`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'File ingestion failed');
    }
    return res.json();
  }

  async getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
    const res = await fetch(`${this.baseUrl}/videos/${videoId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed getting status: HTTP ${res.status}`);
    return res.json();
  }

  async getTranscript(videoId: string): Promise<TranscriptResponse> {
    const res = await fetch(`${this.baseUrl}/videos/${videoId}/transcript`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed getting transcript: HTTP ${res.status}`);
    return res.json();
  }

  async search(args: { query: string; video_ids?: string[]; top_k?: number }): Promise<SearchResponse> {
    const url = args.video_ids && args.video_ids.length === 1 
      ? `${this.baseUrl}/videos/${args.video_ids[0]}/search` 
      : `${this.baseUrl}/search`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: args.query, video_ids: args.video_ids, top_k: args.top_k || 5 }),
    });
    if (!res.ok) throw new Error(`Search failed: HTTP ${res.status}`);
    return res.json();
  }

  async ask(args: { question: string; video_ids?: string[] }): Promise<AskResponse> {
    const url = args.video_ids && args.video_ids.length === 1
      ? `${this.baseUrl}/videos/${args.video_ids[0]}/ask`
      : `${this.baseUrl}/ask`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`Ask query failed: HTTP ${res.status}`);
    return res.json();
  }

  async getInsights(videoId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/videos/${videoId}/insights`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed getting insights: HTTP ${res.status}`);
    return res.json();
  }

  async getEntities(videoId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/videos/${videoId}/entities`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed getting entities: HTTP ${res.status}`);
    return res.json();
  }
}

export const coreClient = new CoreClient();
