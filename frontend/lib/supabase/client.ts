import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

const DEFAULT_SUPABASE_URL = 'https://bgxccwyeohgketwugoyx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_E7g_uVOeStwDBm1Wk-o8ng_WCwxkJXV';

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
