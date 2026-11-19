create table if not exists public.hoya_user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.hoya_user_progress enable row level security;

grant select, insert, update on public.hoya_user_progress to authenticated;

create policy "Learners can read their own progress"
  on public.hoya_user_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can insert their own progress"
  on public.hoya_user_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own progress"
  on public.hoya_user_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
