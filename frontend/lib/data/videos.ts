import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export type Video = Database['public']['Tables']['videos']['Row'];
export type InsertVideo = Database['public']['Tables']['videos']['Insert'];
export type UpdateVideo = Database['public']['Tables']['videos']['Update'];

export async function listVideos(projectId: string): Promise<Video[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('videos')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Video[];
}

export async function getVideo(id: string): Promise<Video | null> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Video;
}

export async function getVideoByCoreId(coreVideoId: string): Promise<Video | null> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('videos')
    .select('*')
    .eq('core_video_id', coreVideoId)
    .single();

  if (error) return null;
  return data as Video;
}

export async function createVideoRecord(input: {
  project_id: string;
  title: string;
  source_type: 'upload' | 'url';
  source_url: string;
  storage_path?: string;
  core_video_id?: string;
  analyzers_used?: string[];
  chunking_mode?: string;
}): Promise<Video> {
  const supabase = createClient();
  const insertPayload: InsertVideo = {
    project_id: input.project_id,
    title: input.title,
    source_type: input.source_type,
    source_url: input.source_url,
    storage_path: input.storage_path || null,
    core_video_id: input.core_video_id || null,
    analyzers_used: input.analyzers_used || [],
    chunking_mode: input.chunking_mode || 'fixed_interval',
    status: 'queued',
    analysis_stage: 'chunking',
  };

  const { data, error } = await (supabase as any)
    .from('videos')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data as Video;
}

export async function updateVideoStatus(
  id: string,
  update: {
    status?: 'queued' | 'analyzing' | 'ready' | 'failed';
    analysis_stage?: string;
    duration_seconds?: number;
    error_message?: string;
    core_video_id?: string;
  }
): Promise<Video> {
  const supabase = createClient();
  const updatePayload: UpdateVideo = update;

  const { data, error } = await (supabase as any)
    .from('videos')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Video;
}
