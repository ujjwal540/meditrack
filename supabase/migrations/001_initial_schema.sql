-- MediTrack initial schema (run in Supabase → SQL Editor, or via the Supabase CLI)

create extension if not exists "pgcrypto";

-- 1. users (profile row for each auth user) -------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'patient' check (role in ('patient', 'caregiver', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- 2. medicines ------------------------------------------------------------
create table public.medicines (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users (id) on delete cascade,
  medicine_name text not null,
  dosage text not null,
  instructions text not null default '',
  notes text,
  created_at timestamptz not null default now()
);

-- 3. medicine_schedules ---------------------------------------------------
create table public.medicine_schedules (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicines (id) on delete cascade,
  reminder_time time not null,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  unique (medicine_id, reminder_time)
);

-- 4. dose_logs ------------------------------------------------------------
create table public.dose_logs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.medicine_schedules (id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'taken', 'snoozed', 'not_confirmed')),
  snoozed_until timestamptz,
  recorded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (schedule_id, scheduled_at)   -- no duplicate dose records
);

-- 5. caregiver_connections ------------------------------------------------
create table public.caregiver_connections (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users (id) on delete cascade,
  caregiver_id uuid references public.users (id) on delete cascade,
  caregiver_email text not null,
  consent_status text not null default 'invited'
    check (consent_status in ('invited', 'accepted', 'granted', 'revoked')),
  grace_minutes int not null default 30,
  created_at timestamptz not null default now(),
  unique (patient_id, caregiver_email)
);

-- 6. documents ------------------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users (id) on delete cascade,
  file_path text not null,
  document_type text not null check (document_type in ('prescription', 'other')),
  created_at timestamptz not null default now()
);

create index on public.medicines (patient_id);
create index on public.medicine_schedules (medicine_id);
create index on public.dose_logs (schedule_id, scheduled_at);
create index on public.caregiver_connections (patient_id);
create index on public.caregiver_connections (caregiver_id);

-- Row Level Security --------------------------------------------------------
alter table public.users enable row level security;
alter table public.medicines enable row level security;
alter table public.medicine_schedules enable row level security;
alter table public.dose_logs enable row level security;
alter table public.caregiver_connections enable row level security;
alter table public.documents enable row level security;

-- Can the current user see this patient's medication data?
-- Yes if it's themselves, or a caregiver the patient has explicitly granted consent to.
create or replace function public.can_view_patient(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select pid = auth.uid() or exists (
    select 1 from public.caregiver_connections c
    where c.patient_id = pid and c.caregiver_id = auth.uid() and c.consent_status = 'granted'
  );
$$;

-- users
create policy "read self or consented patient" on public.users for select
  using (public.can_view_patient(id));
create policy "update self" on public.users for update using (id = auth.uid());

-- medicines
create policy "caregivers/patients read medicines" on public.medicines for select
  using (public.can_view_patient(patient_id));
create policy "patient writes own medicines" on public.medicines for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- medicine_schedules
create policy "read schedules" on public.medicine_schedules for select
  using (exists (select 1 from public.medicines m
                 where m.id = medicine_id and public.can_view_patient(m.patient_id)));
create policy "patient writes own schedules" on public.medicine_schedules for all
  using (exists (select 1 from public.medicines m where m.id = medicine_id and m.patient_id = auth.uid()))
  with check (exists (select 1 from public.medicines m where m.id = medicine_id and m.patient_id = auth.uid()));

-- dose_logs
create policy "read dose logs" on public.dose_logs for select
  using (exists (select 1 from public.medicine_schedules s
                 join public.medicines m on m.id = s.medicine_id
                 where s.id = schedule_id and public.can_view_patient(m.patient_id)));
create policy "patient writes own dose logs" on public.dose_logs for all
  using (exists (select 1 from public.medicine_schedules s
                 join public.medicines m on m.id = s.medicine_id
                 where s.id = schedule_id and m.patient_id = auth.uid()))
  with check (exists (select 1 from public.medicine_schedules s
                 join public.medicines m on m.id = s.medicine_id
                 where s.id = schedule_id and m.patient_id = auth.uid()));

-- caregiver_connections
create policy "patient manages own connections" on public.caregiver_connections for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy "caregiver sees own invitations" on public.caregiver_connections for select
  using (caregiver_id = auth.uid() or caregiver_email = (select email from public.users where id = auth.uid()));
-- A caregiver may accept an invitation (the patient alone grants consent).
create policy "caregiver accepts invitation" on public.caregiver_connections for update
  using (caregiver_email = (select email from public.users where id = auth.uid()))
  with check (consent_status in ('accepted') and caregiver_id = auth.uid());

-- documents (private to the patient)
create policy "patient owns documents" on public.documents for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- Storage: create a PRIVATE bucket named "prescriptions" in the dashboard, then:
-- create policy "own prescription files" on storage.objects for all
--   using (bucket_id = 'prescriptions' and (storage.foldername(name))[1] = auth.uid()::text)
--   with check (bucket_id = 'prescriptions' and (storage.foldername(name))[1] = auth.uid()::text);
