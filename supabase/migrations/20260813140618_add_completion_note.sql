alter table public.tasks
  add column if not exists completion_note text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_completion_note_length_check'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_completion_note_length_check
      check (length(completion_note) <= 200) not valid;
  end if;
end
$$;

alter table public.tasks validate constraint tasks_completion_note_length_check;
