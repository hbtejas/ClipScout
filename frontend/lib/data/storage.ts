import { createClient } from '@/lib/supabase/client';

export async function uploadVideoFile(
  file: File,
  projectId: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to upload videos.');
  }

  const fileExt = file.name.split('.').pop() || 'mp4';
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Strict folder structure required by RLS: {user_id}/{projectId}/{uuid}-{filename}
  const storagePath = `${user.id}/${projectId}/${crypto.randomUUID()}-${cleanName}`;

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from('videos').getPublicUrl(storagePath);

  return { storagePath, publicUrl };
}

export async function uploadProjectAsset(
  file: File,
  projectId: string
): Promise<{ storagePath: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to upload assets.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${user.id}/${projectId}/${crypto.randomUUID()}-${cleanName}`;

  const { data, error } = await supabase.storage
    .from('project-assets')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return { storagePath };
}
