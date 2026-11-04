-- ============================================================================
-- 007_preferred_language_and_schema_alignment.sql
-- Alignment with PRD Data Model, Bilingual Support, and Health Tracking
-- ============================================================================

-- 1. Add preferred_language to public.users for bilingual persistence (English & Nepali)
alter table public.users
  add column if not exists preferred_language text not null default 'en'
  check (preferred_language in ('en', 'ne'));

-- 2. Update handle_new_user() to persist preferred_language on registration
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  raw_role text;
  assigned_role text;
  user_lang text;
begin
  raw_role := coalesce(new.raw_user_meta_data ->> 'role', 'patient');
  if raw_role in ('patient', 'caregiver', 'family_caregiver', 'professional_caregiver', 'admin') then
    assigned_role := raw_role;
  else
    assigned_role := 'patient';
  end if;

  user_lang := coalesce(new.raw_user_meta_data ->> 'preferred_language', 'en');
  if user_lang not in ('en', 'ne') then
    user_lang := 'en';
  end if;

  insert into public.users (id, name, email, role, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    assigned_role,
    user_lang
  )
  on conflict (id) do update set
    name = coalesce(nullif(excluded.name, ''), public.users.name),
    role = case when public.users.role is null or public.users.role = 'patient' then excluded.role else public.users.role end,
    preferred_language = excluded.preferred_language;

  return new;
end $$;

-- 3. Align medicines table with type picker ('tablet', 'capsule', 'injection', 'other')
alter table public.medicines
  add column if not exists type text default 'tablet'
  check (type in ('tablet', 'capsule', 'injection', 'other'));

-- 4. Health measurements (blood pressure, sugar, weight, heart rate) with RLS
create table if not exists public.health_measurements (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('blood_pressure', 'weight', 'blood_sugar', 'heart_rate', 'other')),
  value text not null,
  unit text,
  recorded_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

alter table public.health_measurements enable row level security;

drop policy if exists "patient manages own measurements" on public.health_measurements;
create policy "patient manages own measurements" on public.health_measurements
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "caregiver reads measurements with consent" on public.health_measurements;
create policy "caregiver reads measurements with consent" on public.health_measurements
  for select using (public.can_view_patient(patient_id));

create index if not exists idx_health_measurements_patient on public.health_measurements(patient_id, recorded_at desc);

-- 5. Appointments tracking with RLS
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  provider text,
  date date not null,
  time time,
  note text,
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

drop policy if exists "patient manages own appointments" on public.appointments;
create policy "patient manages own appointments" on public.appointments
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "caregiver reads appointments with consent" on public.appointments;
create policy "caregiver reads appointments with consent" on public.appointments
  for select using (public.can_view_patient(patient_id));

create index if not exists idx_appointments_patient on public.appointments(patient_id, date);
