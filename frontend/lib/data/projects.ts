import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export type Project = Database['public']['Tables']['projects']['Row'];
export type InsertProject = Database['public']['Tables']['projects']['Insert'];
export type UpdateProject = Database['public']['Tables']['projects']['Update'];

export async function listProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Project;
}

export async function createProject(input: { name: string; description?: string }): Promise<Project> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const insertPayload: InsertProject = {
    name: input.name,
    description: input.description || null,
    user_id: user.id,
  };

  const { data, error } = await (supabase as any)
    .from('projects')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('projects').delete().eq('id', id);
  if (error) throw error;
}
