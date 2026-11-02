alter table public.users
  add column if not exists timezone text not null default 'UTC';

create table if not exists public.push_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  schedule_id uuid not null references public.medicine_schedules (id) on delete cascade,
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, schedule_id, scheduled_at)
);

alter table public.push_deliveries enable row level security;

create or replace function public.get_due_reminders()
returns table (
  user_id uuid,
  schedule_id uuid,
  scheduled_at timestamptz,
  title text,
  body text
)
language sql
security definer
set search_path = public
as $$
  select
    m.patient_id,
    s.id,
    ((
      (now() at time zone coalesce(u.timezone, 'UTC'))::date
      + s.reminder_time
    ) at time zone coalesce(u.timezone, 'UTC')) as scheduled_at,
    'Time for ' || m.medicine_name,
    m.dosage || case when m.instructions = '' then '' else '. ' || m.instructions end
  from public.medicine_schedules s
  join public.medicines m on m.id = s.medicine_id
  join public.users u on u.id = m.patient_id
  where (now() at time zone coalesce(u.timezone, 'UTC'))::time >= s.reminder_time
    and (now() at time zone coalesce(u.timezone, 'UTC'))::time < s.reminder_time + interval '2 minutes'
    and (now() at time zone coalesce(u.timezone, 'UTC'))::date >= s.start_date
    and (s.end_date is null or (now() at time zone coalesce(u.timezone, 'UTC'))::date <= s.end_date)
    and not exists (
      select 1 from public.dose_logs d
      where d.schedule_id = s.id
        and d.scheduled_at = (
          ((
            (now() at time zone coalesce(u.timezone, 'UTC'))::date
            + s.reminder_time
          ) at time zone coalesce(u.timezone, 'UTC'))
        )
        and d.status in ('taken', 'not_confirmed')
    )
    and not exists (
      select 1 from public.push_deliveries p
      where p.user_id = m.patient_id
        and p.schedule_id = s.id
        and p.scheduled_at = (
          ((
            (now() at time zone coalesce(u.timezone, 'UTC'))::date
            + s.reminder_time
          ) at time zone coalesce(u.timezone, 'UTC'))
        )
    );
$$;
