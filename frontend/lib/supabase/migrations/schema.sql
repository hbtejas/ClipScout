-- Extensions
create extension if not exists "pgcrypto";

-- ========== PROJECTS ==========
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on projects(user_id);

-- ========== VIDEOS ==========
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  core_video_id text,                      -- id assigned by the processing engine, set once ingest starts
  title text not null,
  source_type text not null check (source_type in ('upload','url')),
  source_url text not null,
  storage_path text,                       -- path within the `videos` storage bucket, if uploaded
  duration_seconds numeric,
  status text not null default 'queued' check (status in ('queued','analyzing','ready','failed')),
  analysis_stage text,
  analyzers_used text[] not null default '{}',
  chunking_mode text not null default 'fixed_interval',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_videos_project_id on videos(project_id);
create index if not exists idx_videos_status on videos(status);
create unique index if not exists idx_videos_core_video_id on videos(core_video_id) where core_video_id is not null;

-- ========== CONVERSATIONS ==========
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text,
  video_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_project_id on conversations(project_id);

-- ========== MESSAGES ==========
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content text,
  tool_calls jsonb,
  tool_results jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_id on messages(conversation_id);

-- ========== updated_at TRIGGER (generic, reusable) ==========
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger trg_videos_updated_at before update on videos
  for each row execute function set_updated_at();
create trigger trg_conversations_updated_at before update on conversations
  for each row execute function set_updated_at();

-- ========== ROW LEVEL SECURITY ==========
alter table projects enable row level security;
alter table videos enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Projects: direct ownership
create policy "projects_select_own" on projects for select
  using (auth.uid() = user_id);
create policy "projects_insert_own" on projects for insert
  with check (auth.uid() = user_id);
create policy "projects_update_own" on projects for update
  using (auth.uid() = user_id);
create policy "projects_delete_own" on projects for delete
  using (auth.uid() = user_id);

-- Videos: ownership via parent project
create policy "videos_select_own" on videos for select
  using (exists (select 1 from projects p where p.id = videos.project_id and p.user_id = auth.uid()));
create policy "videos_insert_own" on videos for insert
  with check (exists (select 1 from projects p where p.id = videos.project_id and p.user_id = auth.uid()));
create policy "videos_update_own" on videos for update
  using (exists (select 1 from projects p where p.id = videos.project_id and p.user_id = auth.uid()));
create policy "videos_delete_own" on videos for delete
  using (exists (select 1 from projects p where p.id = videos.project_id and p.user_id = auth.uid()));

-- Conversations: ownership via parent project
create policy "conversations_select_own" on conversations for select
  using (exists (select 1 from projects p where p.id = conversations.project_id and p.user_id = auth.uid()));
create policy "conversations_insert_own" on conversations for insert
  with check (exists (select 1 from projects p where p.id = conversations.project_id and p.user_id = auth.uid()));
create policy "conversations_update_own" on conversations for update
  using (exists (select 1 from projects p where p.id = conversations.project_id and p.user_id = auth.uid()));
create policy "conversations_delete_own" on conversations for delete
  using (exists (select 1 from projects p where p.id = conversations.project_id and p.user_id = auth.uid()));

-- Messages: ownership via conversation -> project
create policy "messages_select_own" on messages for select
  using (exists (
    select 1 from conversations c
    join projects p on p.id = c.project_id
    where c.id = messages.conversation_id and p.user_id = auth.uid()
  ));
create policy "messages_insert_own" on messages for insert
  with check (exists (
    select 1 from conversations c
    join projects p on p.id = c.project_id
    where c.id = messages.conversation_id and p.user_id = auth.uid()
  ));
create policy "messages_delete_own" on messages for delete
  using (exists (
    select 1 from conversations c
    join projects p on p.id = c.project_id
    where c.id = messages.conversation_id and p.user_id = auth.uid()
  ));

-- ========== STORAGE BUCKETS ==========
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', false)
on conflict (id) do nothing;

-- ========== STORAGE RLS POLICIES ==========
create policy "videos_bucket_read_public" on storage.objects
  for select using (bucket_id = 'videos');

create policy "videos_bucket_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "videos_bucket_delete_own" on storage.objects
  for delete using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "project_assets_all_own" on storage.objects
  for all using (
    bucket_id = 'project-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'project-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
