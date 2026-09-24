-- Run this migration against the existing ACE Supabase project only after review.
-- A-level data is isolated in dedicated tables so existing TMUA rows and policies
-- do not need to change.

create or replace function public.set_a_level_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.a_level_user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_subject_id text,
  exam_year smallint check (exam_year is null or exam_year between 2026 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint a_level_active_subject_check check (
    active_subject_id is null or active_subject_id in (
      'mathematics', 'physics', 'biology', 'chemistry', 'computer-science', 'economics'
    )
  )
);

create table if not exists public.a_level_subject_selections (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null check (subject_id in (
    'mathematics', 'physics', 'biology', 'chemistry', 'computer-science', 'economics'
  )),
  specification_id text,
  target_grade text check (target_grade is null or target_grade in ('A*', 'A', 'B', 'C', 'D', 'E')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);

create table if not exists public.a_level_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  specification_id text not null default 'board-neutral',
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, subject_id, specification_id, lesson_id)
);

create table if not exists public.a_level_practice_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  specification_id text not null default 'board-neutral',
  assessment_id text not null,
  score numeric not null check (score >= 0),
  max_score numeric not null check (max_score > 0 and score <= max_score),
  result jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now()
);

-- Kept separate from the existing one-row-per-user TMUA entitlements table.
-- A dedicated A-level webhook/sync function will be the only writer.
create table if not exists public.a_level_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  premium boolean not null default false,
  product_id text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists a_level_practice_results_user_date_idx
  on public.a_level_practice_results (user_id, completed_at desc);

drop trigger if exists a_level_user_settings_set_updated_at on public.a_level_user_settings;
create trigger a_level_user_settings_set_updated_at
before update on public.a_level_user_settings
for each row execute function public.set_a_level_updated_at();

drop trigger if exists a_level_subject_selections_set_updated_at on public.a_level_subject_selections;
create trigger a_level_subject_selections_set_updated_at
before update on public.a_level_subject_selections
for each row execute function public.set_a_level_updated_at();

alter table public.a_level_user_settings enable row level security;
alter table public.a_level_subject_selections enable row level security;
alter table public.a_level_lesson_progress enable row level security;
alter table public.a_level_practice_results enable row level security;
alter table public.a_level_entitlements enable row level security;

create policy "Users manage their A-level settings"
on public.a_level_user_settings for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their A-level subjects"
on public.a_level_subject_selections for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their A-level lesson progress"
on public.a_level_lesson_progress for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their A-level practice results"
on public.a_level_practice_results for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users read their A-level entitlement"
on public.a_level_entitlements for select to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.a_level_user_settings to authenticated;
grant select, insert, update, delete on public.a_level_subject_selections to authenticated;
grant select, insert, update, delete on public.a_level_lesson_progress to authenticated;
grant select, insert, update, delete on public.a_level_practice_results to authenticated;
grant select on public.a_level_entitlements to authenticated;
