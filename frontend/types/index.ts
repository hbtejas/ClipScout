export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Video {
  id: string;
  project_id: string;
  core_video_id: string;
  title: string;
  source_type: 'upload' | 'url';
  source_url: string;
  storage_path?: string;
  duration_seconds?: number;
  status: 'queued' | 'analyzing' | 'ready' | 'failed';
  analysis_stage?: string;
  analyzers_used: string[];
  chunking_mode: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  title?: string;
  video_ids: string[];
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any;
  tool_results?: any;
  created_at: string;
}

export interface SourceMoment {
  video_id: string;
  chunk_id: string;
  start_s: number;
  end_s: number;
  label?: string;
}

export interface AnalyzerMeta {
  id: string;
  label: string;
  requires: 'frames' | 'audio' | 'none';
  available: boolean;
}

export interface SearchResultItem {
  video_id: string;
  chunk_id: string;
  start_s: number;
  end_s: number;
  formatted_start?: string;
  formatted_end?: string;
  text: string;
  score: number;
}
