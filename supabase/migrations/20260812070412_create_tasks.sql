create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  client text not null check (length(trim(client)) > 0),
  task text not null check (length(trim(task)) > 0),
  task_order integer not null check (task_order > 0),
  deadline timestamptz not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_status_deadline_idx
  on public.tasks (user_id, completed_at, cancelled_at, deadline);

alter table public.tasks enable row level security;

create policy "Users can read their tasks"
  on public.tasks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their tasks"
  on public.tasks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their tasks"
  on public.tasks for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their tasks"
  on public.tasks for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
