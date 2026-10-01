-- Add to the canonical shared-backend migration history before deploying.
-- Never deploy this worktree's independent migration history to production.
-- Core course columns remain authoritative. JSON stores the additive v2 plan fields.
alter table public.a_level_user_settings
  add column if not exists study_plan jsonb;
alter table public.a_level_user_settings
  add constraint a_level_study_plan_object check (study_plan is null or jsonb_typeof(study_plan) = 'object');
-- Existing row-level policies already restrict this column to its owning user.
