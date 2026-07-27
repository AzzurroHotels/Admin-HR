-- Remove all application test data from Main System.
-- This keeps Supabase Authentication users and user_profiles intact.
-- Run this before adding live records.

begin;

truncate table public.project_task_updates restart identity cascade;
truncate table public.project_tasks restart identity cascade;
truncate table public.roster_assignments restart identity cascade;
truncate table public.published_rosters restart identity cascade;
truncate table public.receptionist_evaluations restart identity cascade;
truncate table public.staff_notes restart identity cascade;
truncate table public.staff_members restart identity cascade;
truncate table public.roster_rows restart identity cascade;

commit;

-- Run main_system_property_seed.sql afterward to restore only property and shift templates.
