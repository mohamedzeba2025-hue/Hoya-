-- Hoya backend security hardening
-- Keep the admin predicate outside the exposed API schema and restrict its execution.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$function$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Trigger-only function: remove direct RPC execution rights.
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses"
  on public.courses for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "Public read published courses" on public.courses;
create policy "Public read published courses"
  on public.courses for select to anon, authenticated
  using (is_published);

drop policy if exists "Admins manage enrollments" on public.enrollments;
create policy "Admins manage enrollments"
  on public.enrollments for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "Users read own enrollments" on public.enrollments;
create policy "Users read own enrollments"
  on public.enrollments for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons"
  on public.lessons for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "Public read published lessons" on public.lessons;
create policy "Public read published lessons"
  on public.lessons for select to anon, authenticated
  using (
    is_published
    and exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.is_published
    )
  );

drop policy if exists "Admins read progress" on public.lesson_progress;
create policy "Admins read progress"
  on public.lesson_progress for select to authenticated
  using (private.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
  on public.profiles for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- User-editable profile field only. Admin role is not writable through the client API.
grant update (full_name) on public.profiles to authenticated;

-- Remove the old helper after all policies are moved.
drop function if exists public.is_admin();

-- Indexes for foreign-key lookups flagged by the advisor.
create index if not exists courses_created_by_idx on public.courses (created_by);
create index if not exists hoya_courses_language_idx on public.hoya_courses (language_id);
create index if not exists hoya_exercises_lesson_idx on public.hoya_exercises (lesson_id);
create index if not exists hoya_lessons_module_idx on public.hoya_lessons (module_id);
create index if not exists hoya_modules_course_idx on public.hoya_modules (course_id);