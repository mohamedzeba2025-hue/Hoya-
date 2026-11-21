create table if not exists public.hoya_account_progress_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.hoya_account_progress_snapshots enable row level security;

grant select, insert, update on public.hoya_account_progress_snapshots to authenticated;

create policy "Users read own account progress snapshot"
  on public.hoya_account_progress_snapshots
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own account progress snapshot"
  on public.hoya_account_progress_snapshots
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own account progress snapshot"
  on public.hoya_account_progress_snapshots
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);