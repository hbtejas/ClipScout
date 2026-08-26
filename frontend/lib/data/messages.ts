import { createClient } from '@/lib/supabase/server';
import type { Database, Json } from '@/types/supabase';

export type Message = Database['public']['Tables']['messages']['Row'];
export type InsertMessage = Database['public']['Tables']['messages']['Insert'];

export async function listMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Message[];
}

export async function insertMessage(input: {
  conversation_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Json;
  tool_results?: Json;
}): Promise<Message> {
  const supabase = createClient();
  const insertPayload: InsertMessage = {
    conversation_id: input.conversation_id,
    role: input.role,
    content: input.content,
    tool_calls: input.tool_calls || null,
    tool_results: input.tool_results || null,
  };

  const { data, error } = await (supabase as any)
    .from('messages')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}
