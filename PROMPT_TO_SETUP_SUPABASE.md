# MASTER SETUP PROMPT — Supabase Auth, Database & Storage for ClipScout

Copy and use this entire prompt to set up Supabase for the **ClipScout Conversational Video RAG** application.

---

## 1. OVERVIEW & GOAL

Set up a Supabase project as the single source of truth for:
- **Authentication**: Email/password sign-up, sign-in, session refresh via `@supabase/ssr`, and route protection.
- **PostgreSQL Database**: Tables for `projects`, `videos`, `conversations`, and `messages` with strict Row Level Security (RLS).
- **Object Storage**:
  - `videos` (public bucket for raw video files that the processing engine can fetch by public URL).
  - `project-assets` (private bucket for user thumbnails and project exports).

---

## 2. STEP 1: SQL MIGRATION SCRIPT

Run this entire SQL block in the **Supabase Dashboard → SQL Editor → New Query**:

```sql
-- Extensions
create extension if not exists "pgcrypto";

-- ========== 1. PROJECTS TABLE ==========
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on projects(user_id);

-- ========== 2. VIDEOS TABLE ==========
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  core_video_id text,                      -- id assigned by the processing engine
  title text not null,
  source_type text not null check (source_type in ('upload','url')),
  source_url text not null,
  storage_path text,                       -- path in 'videos' storage bucket, if uploaded
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

-- ========== 3. CONVERSATIONS TABLE ==========
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text,
  video_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_project_id on conversations(project_id);

-- ========== 4. MESSAGES TABLE ==========
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

-- ========== 5. AUTO-UPDATE TIMESTAMPS TRIGGER ==========
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

-- ========== 6. ROW LEVEL SECURITY (RLS) ==========
alter table projects enable row level security;
alter table videos enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Projects: user ownership
create policy "projects_select_own" on projects for select using (auth.uid() = user_id);
create policy "projects_insert_own" on projects for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on projects for update using (auth.uid() = user_id);
create policy "projects_delete_own" on projects for delete using (auth.uid() = user_id);

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

-- ========== 7. STORAGE BUCKETS & POLICIES ==========
insert into storage.buckets (id, name, public) values ('videos', 'videos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('project-assets', 'project-assets', false) on conflict (id) do nothing;

create policy "videos_bucket_read_public" on storage.objects for select using (bucket_id = 'videos');
create policy "videos_bucket_insert_own" on storage.objects for insert with check (
  bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "videos_bucket_delete_own" on storage.objects for delete using (
  bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "project_assets_all_own" on storage.objects for all using (
  bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 3. STEP 2: SUPABASE AUTH DASHBOARD SETTINGS

1. In **Authentication → Providers → Email**:
   - Ensure **Enable Email provider** is toggled ON.
   - For fast local testing, you can disable **Confirm email**.
2. In **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`.

---

## 4. STEP 3: ENVIRONMENT VARIABLES

Copy your keys from **Project Settings → API** in Supabase:

### `frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

CORE_API_URL=http://127.0.0.1:8077
NEXT_PUBLIC_CORE_API_URL=http://127.0.0.1:8077
OPENAI_API_KEY=your_openai_key
```

### `core/.env`
```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
VIDEOMIND_BUCKET=videos
OPENAI_API_KEY=your_openai_key
```

---

## 5. STEP 4: NEXT.JS APP FILES & INTEGRATION

The following files in the project handle the Supabase integration:

1. **Browser Client**: `frontend/lib/supabase/client.ts`
   - Uses `createBrowserClient<Database>` for client components (`/login`, `/signup`, `upload-dialog`).
2. **Server Client**: `frontend/lib/supabase/server.ts`
   - Uses `createServerClient<Database>` with cookie store for Server Components and Route Handlers.
3. **Admin Client**: `frontend/lib/supabase/admin.ts`
   - Uses `createClient<Database>` with `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for server reconciliation.
4. **Session Middleware**: `frontend/middleware.ts`
   - Runs `supabase.auth.getUser()` on incoming requests.
   - Redirects unauthenticated users attempting to access `/projects/*` to `/login`.
   - Redirects logged-in users away from `/login` and `/signup` to `/projects`.
5. **Storage Upload Helper**: `frontend/lib/data/storage.ts`
   - Formats file upload paths as `${user.id}/${projectId}/${uuid}-${file.name}` to satisfy storage RLS policies.
6. **Data Helpers**: `frontend/lib/data/{projects,videos,conversations,messages}.ts`
   - Typed CRUD functions that enforce session user ownership.
7. **Status Sync Route**: `frontend/app/api/videos/[id]/sync/route.ts`
   - Polling endpoint reconciling the `core` processing engine status into Supabase.

---

## 6. VERIFICATION CHECKLIST

- [x] Run SQL script in Supabase SQL Editor.
- [x] Paste `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` into `frontend/.env.local`.
- [x] Start app (`npm run dev` in `frontend/`, `python serve.py` in `core/`).
- [x] Register account at `http://localhost:3000/signup`.
- [x] Verify redirect to `/projects` after login.
- [x] Create project and upload video to verify Storage and Postgres row creation.
