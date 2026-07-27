create extension if not exists pgcrypto;

create or replace function public.new_text_id(prefix text)
returns text language sql volatile as $$ select prefix || '_' || replace(gen_random_uuid()::text, '-', '') $$;

create table if not exists public.user_profiles (
  id text primary key default public.new_text_id('user'),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text not null default '', email text unique not null,
  role text not null default 'Manager' check (role in ('Admin','Manager')),
  account_status text not null default 'Active' check (account_status in ('Active','Inactive')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), last_login_at timestamptz
);
create table if not exists public.staff_members (
  id text primary key default public.new_text_id('staff'), full_name text not null,
  contact_number text, email_address text, email text, telegram_whatsapp text, emergency_contact text,
  date_started date, employment_type text, primary_department text not null, department text,
  original_department text, primary_property text, position_title text,
  account_status text not null default 'Active', status text not null default 'Active',
  bank_account_name text, bank_name text, bsb_number text, bank_account_number text, abn_number text, tfn_number text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.staff_notes (
  id text primary key default public.new_text_id('note'), staff_member_id text not null references public.staff_members(id) on delete cascade,
  occurrence_date date, department text, note_type text, note text not null, created_by uuid references auth.users(id), author_email text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_tasks (
  id text primary key default public.new_text_id('task'), title text not null, description text, department text default 'Operations', project_name text,
  sprint_name text, status text not null default 'To Do', priority text not null default 'Medium', assignee text, due_date date, labels text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_task_updates (
  id text primary key default public.new_text_id('update'), task_id text not null references public.project_tasks(id) on delete cascade,
  note text not null, author_name text, author_email text, created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.receptionist_evaluations (
  id text primary key default public.new_text_id('evaluation'), staff_member_id text not null references public.staff_members(id) on delete cascade,
  evaluation_date date not null, evaluator_name text not null, evaluator_email text, evaluator_user_id uuid references auth.users(id),
  total_score numeric not null default 100, total_deduction numeric not null default 0, rating text,
  faults jsonb not null default '[]'::jsonb, positive_observations text, coaching_notes text, agreed_actions text,
  follow_up_date date, acknowledgement_status text default 'Pending', employee_comments text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.roster_rows (
  id text primary key default public.new_text_id('row'), department text, property_name text, row_name text, shift_label text,
  start_time time, end_time time, crosses_midnight boolean default false, break_minutes integer default 0, display_order integer default 0,
  staff_type text not null, is_active boolean not null default true, active_days jsonb not null default '[0,1,2,3,4,5,6]'::jsonb,
  shift_hours numeric default 0, paid_hours numeric default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.roster_assignments (
  id text primary key default public.new_text_id('assignment'), week_start_date date not null,
  roster_row_id text not null references public.roster_rows(id) on delete cascade, assignment_date date not null,
  staff_member_id text not null references public.staff_members(id) on delete cascade, assignment_note text,
  start_time_override time, end_time_override time, conflict_overridden boolean default false, conflict_override_reason text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(roster_row_id, assignment_date, staff_member_id)
);
create table if not exists public.published_rosters (
  id text primary key default public.new_text_id('published'), week_start_date date not null, roster_type text not null,
  status text not null default 'Published', published_at timestamptz not null default now(), published_by text,
  rows jsonb not null default '[]'::jsonb, assignments jsonb not null default '[]'::jsonb,
  unique(week_start_date, roster_type)
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['user_profiles','staff_members','staff_notes','project_tasks','receptionist_evaluations','roster_rows','roster_assignments'] loop execute format('drop trigger if exists set_updated_at on public.%I',t); execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',t); end loop; end $$;

create or replace function public.handle_new_user() returns trigger security definer set search_path=public language plpgsql as $$
begin
 insert into public.user_profiles(auth_user_id,full_name,email,role,account_status)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),new.email,
        'Manager','Inactive')
 on conflict(auth_user_id) do nothing;
 return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.current_role() returns text stable security definer set search_path=public language sql as $$
 select role from public.user_profiles where auth_user_id=auth.uid() and account_status='Active' limit 1
$$;
create or replace function public.is_admin() returns boolean stable language sql as $$ select coalesce(public.current_role()='Admin',false) $$;
create or replace function public.is_manager_or_admin() returns boolean stable language sql as $$ select coalesce(public.current_role() in ('Admin','Manager'),false) $$;

alter table public.user_profiles enable row level security;
alter table public.staff_members enable row level security;
alter table public.staff_notes enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_task_updates enable row level security;
alter table public.receptionist_evaluations enable row level security;
alter table public.roster_rows enable row level security;
alter table public.roster_assignments enable row level security;
alter table public.published_rosters enable row level security;

drop policy if exists "profiles self or admin read" on public.user_profiles;
drop policy if exists "admin profiles write" on public.user_profiles;
drop policy if exists "staff authenticated read" on public.staff_members;
drop policy if exists "staff admin write" on public.staff_members;
drop policy if exists "notes authenticated read" on public.staff_notes;
drop policy if exists "notes admin write" on public.staff_notes;
drop policy if exists "tasks admin all" on public.project_tasks;
drop policy if exists "task updates admin all" on public.project_task_updates;
drop policy if exists "evaluations authenticated read" on public.receptionist_evaluations;
drop policy if exists "evaluations authenticated create" on public.receptionist_evaluations;
drop policy if exists "evaluations admin update" on public.receptionist_evaluations;
drop policy if exists "evaluations admin delete" on public.receptionist_evaluations;
drop policy if exists "roster rows admin all" on public.roster_rows;
drop policy if exists "roster assignments admin all" on public.roster_assignments;
drop policy if exists "published admin write" on public.published_rosters;
drop policy if exists "published public read" on public.published_rosters;

create policy "profiles self or admin read" on public.user_profiles for select using (auth_user_id=auth.uid() or public.is_admin());
create policy "admin profiles write" on public.user_profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "staff authenticated read" on public.staff_members for select using (public.is_manager_or_admin());
create policy "staff admin write" on public.staff_members for all using (public.is_admin()) with check (public.is_admin());
create policy "notes authenticated read" on public.staff_notes for select using (public.is_manager_or_admin());
create policy "notes admin write" on public.staff_notes for all using (public.is_admin()) with check (public.is_admin());
create policy "tasks admin all" on public.project_tasks for all using (public.is_admin()) with check (public.is_admin());
create policy "task updates admin all" on public.project_task_updates for all using (public.is_admin()) with check (public.is_admin());
create policy "evaluations authenticated read" on public.receptionist_evaluations for select using (public.is_manager_or_admin());
create policy "evaluations authenticated create" on public.receptionist_evaluations for insert with check (public.is_manager_or_admin() and evaluator_user_id=auth.uid());
create policy "evaluations admin update" on public.receptionist_evaluations for update using (public.is_admin()) with check (public.is_admin());
create policy "evaluations admin delete" on public.receptionist_evaluations for delete using (public.is_admin());
create policy "roster rows admin all" on public.roster_rows for all using (public.is_admin()) with check (public.is_admin());
create policy "roster assignments admin all" on public.roster_assignments for all using (public.is_admin()) with check (public.is_admin());
create policy "published admin write" on public.published_rosters for all using (public.is_admin()) with check (public.is_admin());
create policy "published public read" on public.published_rosters for select using (status='Published');

grant usage on schema public to anon, authenticated;
grant select on public.published_rosters to anon;
grant select,insert,update,delete on all tables in schema public to authenticated;

create or replace function public.copy_roster_week(source_week date, destination_week date)
returns jsonb security definer set search_path=public language plpgsql as $$
declare copied_count integer;
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 insert into public.roster_assignments(week_start_date,roster_row_id,assignment_date,staff_member_id,assignment_note,start_time_override,end_time_override,conflict_overridden,conflict_override_reason,created_by)
 select destination_week, roster_row_id, assignment_date + (destination_week - source_week), staff_member_id, assignment_note,start_time_override,end_time_override,conflict_overridden,conflict_override_reason,auth.uid()
 from public.roster_assignments where week_start_date=source_week
 on conflict(roster_row_id,assignment_date,staff_member_id) do nothing;
 get diagnostics copied_count=row_count;
 return jsonb_build_object('copied',copied_count);
end $$;
grant execute on function public.copy_roster_week(date,date) to authenticated;


create index if not exists idx_staff_department_status on public.staff_members(primary_department,account_status);
create index if not exists idx_eval_staff_date on public.receptionist_evaluations(staff_member_id,evaluation_date);
create index if not exists idx_assign_week on public.roster_assignments(week_start_date);
create index if not exists idx_updates_task on public.project_task_updates(task_id,created_at desc);
