create index if not exists enrollments_course_id_idx on public.enrollments(course_id);
create index if not exists hoya_user_progress_lesson_id_idx on public.hoya_user_progress(lesson_id);
create index if not exists lesson_progress_lesson_id_idx on public.lesson_progress(lesson_id);