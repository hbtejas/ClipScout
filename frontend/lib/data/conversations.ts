import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type InsertConversation = Database['public']['Tables']['conversations']['Insert'];
export type UpdateConversation = Database['public']['Tables']['conversations']['Update'];

export async function listConversations(projectId: string): Promise<Conversation[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('conversations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Conversation[];
}

export async function createConversation(input: {
  project_id: string;
  title?: string;
  video_ids?: string[];
}): Promise<Conversation> {
  const supabase = createClient();
  const insertPayload: InsertConversation = {
    project_id: input.project_id,
    title: input.title || 'New Conversation',
    video_ids: input.video_ids || [],
  };

  const { data, error } = await (supabase as any)
    .from('conversations')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function updateConversationVideos(id: string, video_ids: string[]): Promise<Conversation> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('conversations')
    .update({ video_ids })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}
