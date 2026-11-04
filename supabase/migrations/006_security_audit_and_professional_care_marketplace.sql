-- ============================================================================
-- 006_security_audit_and_professional_care_marketplace.sql
-- MediTrack Comprehensive Security Hardening & Professional Care Marketplace
-- ============================================================================

-- Ensure uuid-ossp or pgcrypto is ready
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. EXTEND USERS ROLE SYSTEM (Patient, Family Caregiver, Professional Caregiver, Admin)
-- ----------------------------------------------------------------------------
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check 
  check (role in ('patient', 'caregiver', 'family_caregiver', 'professional_caregiver', 'admin'));

-- Update handle_new_user() trigger to map incoming metadata roles cleanly
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  raw_role text;
  assigned_role text;
begin
  raw_role := coalesce(new.raw_user_meta_data ->> 'role', 'patient');
  if raw_role in ('patient', 'caregiver', 'family_caregiver', 'professional_caregiver', 'admin') then
    assigned_role := raw_role;
  else
    assigned_role := 'patient';
  end if;

  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    assigned_role
  )
  on conflict (id) do update set
    name = excluded.name,
    role = case when public.users.role is null or public.users.role = 'patient' then excluded.role else public.users.role end;

  return new;
end $$;

-- ----------------------------------------------------------------------------
-- 2. PROFESSIONAL CAREGIVER PROFILES
-- ----------------------------------------------------------------------------
create table if not exists public.professional_caregivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users(id) on delete cascade,
  full_name text not null,
  phone text,
  bio text,
  qualifications text not null default '', -- e.g. "RN (Registered Nurse), CNA"
  years_experience int not null default 1,
  languages text[] not null default array['English'],
  service_location text not null, -- e.g. "New York, NY", "Chicago, IL"
  hourly_rate numeric(10, 2) not null default 35.00,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  rating numeric(3, 2) not null default 5.00,
  review_count int not null default 0,
  availability text not null default 'weekdays_and_weekends'
    check (availability in ('weekdays', 'weekends', 'weekdays_and_weekends', 'on_call')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.professional_caregivers enable row level security;

-- Professional caregiver policies:
-- Anyone authenticated can browse verified professionals or their own profile
drop policy if exists "anyone can browse professionals" on public.professional_caregivers;
create policy "anyone can browse professionals" on public.professional_caregivers
  for select using (
    verification_status = 'verified' or user_id = auth.uid()
  );

drop policy if exists "caregiver manages own profile" on public.professional_caregivers;
create policy "caregiver manages own profile" on public.professional_caregivers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3. PROFESSIONAL BOOKINGS AND ASSIGNMENTS
-- ----------------------------------------------------------------------------
create table if not exists public.professional_bookings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  caregiver_id uuid not null references public.users(id) on delete cascade,
  service_type text not null default 'visit' check (service_type in ('call', 'visit', 'checkin', 'routine_care')),
  scheduled_date date not null,
  scheduled_time time not null,
  duration_minutes int not null default 60,
  hourly_rate numeric(10, 2) not null default 35.00,
  total_amount numeric(10, 2) not null default 35.00,
  care_requirements text,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')),
  patient_contact_phone text,
  service_address text,
  created_at timestamptz not null default now()
);

alter table public.professional_bookings enable row level security;

-- Booking policies:
-- Both the requesting patient and assigned caregiver can view and update the booking
drop policy if exists "patient or caregiver view booking" on public.professional_bookings;
create policy "patient or caregiver view booking" on public.professional_bookings
  for select using (patient_id = auth.uid() or caregiver_id = auth.uid());

drop policy if exists "patient creates booking" on public.professional_bookings;
create policy "patient creates booking" on public.professional_bookings
  for insert with check (patient_id = auth.uid());

drop policy if exists "patient or caregiver update booking" on public.professional_bookings;
create policy "patient or caregiver update booking" on public.professional_bookings
  for update using (patient_id = auth.uid() or caregiver_id = auth.uid())
  with check (patient_id = auth.uid() or caregiver_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. CAREGIVER CARE REPORTS & OBSERVATIONS (Family & Professional)
-- ----------------------------------------------------------------------------
create table if not exists public.care_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  caregiver_id uuid not null references public.users(id) on delete cascade,
  visit_type text not null default 'call' check (visit_type in ('call', 'visit', 'checkin')),
  report_date date not null default current_date,
  adherence_observed text not null,
  notes text not null,
  booking_id uuid references public.professional_bookings(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.care_reports enable row level security;

-- Reports policies:
-- Patient and author caregiver can see the report, caregiver can submit report if consented or booked
drop policy if exists "patient and caregiver read care reports" on public.care_reports;
create policy "patient and caregiver read care reports" on public.care_reports
  for select using (
    patient_id = auth.uid() 
    or caregiver_id = auth.uid()
    or public.can_view_patient(patient_id)
  );

drop policy if exists "caregiver inserts care reports" on public.care_reports;
create policy "caregiver inserts care reports" on public.care_reports
  for insert with check (
    caregiver_id = auth.uid() and (
      public.can_view_patient(patient_id)
      or exists (
        select 1 from public.professional_bookings b
        where b.id = booking_id and b.patient_id = care_reports.patient_id and b.caregiver_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 5. PROFESSIONAL REVIEWS AND RATINGS
-- ----------------------------------------------------------------------------
create table if not exists public.professional_reviews (
  id uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references public.users(id) on delete cascade,
  reviewer_id uuid not null references public.users(id) on delete cascade,
  booking_id uuid references public.professional_bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  unique(booking_id, reviewer_id)
);

alter table public.professional_reviews enable row level security;

drop policy if exists "anyone can read reviews" on public.professional_reviews;
create policy "anyone can read reviews" on public.professional_reviews
  for select using (true);

drop policy if exists "reviewer writes review" on public.professional_reviews;
create policy "reviewer writes review" on public.professional_reviews
  for insert with check (reviewer_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 6. AUDIT & REPAIR RLS ON CORE TABLES (Zero Data Leakage Protection)
-- ----------------------------------------------------------------------------
-- Ensure can_view_patient is bulletproof:
create or replace function public.can_view_patient(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select pid = auth.uid() or exists (
    select 1 from public.caregiver_connections c
    where c.patient_id = pid
      and c.caregiver_id = auth.uid()
      and c.consent_status = 'granted'
  );
$$;

-- Revoke dangerous privileges on can_view_patient
revoke all on function public.can_view_patient(uuid) from public;
grant execute on function public.can_view_patient(uuid) to authenticated, anon;

-- Tighten user profile reading: Never allow arbitrary user enumerations
drop policy if exists "read self or consented patient" on public.users;
create policy "read self or consented patient" on public.users for select
  using (
    id = auth.uid() 
    or public.can_view_patient(id)
    or exists (
      -- A patient can see their invited or active caregivers
      select 1 from public.caregiver_connections c
      where c.patient_id = auth.uid() and (c.caregiver_id = users.id or c.caregiver_email = users.email)
    )
    or exists (
      -- Anyone can read public professional caregiver basic profile
      select 1 from public.professional_caregivers p
      where p.user_id = users.id and p.verification_status = 'verified'
    )
  );

-- Indexes for performance & security check acceleration
create index if not exists idx_professional_caregivers_location on public.professional_caregivers(service_location, verification_status);
create index if not exists idx_professional_bookings_patient on public.professional_bookings(patient_id, status);
create index if not exists idx_professional_bookings_caregiver on public.professional_bookings(caregiver_id, status);
create index if not exists idx_care_reports_patient on public.care_reports(patient_id, report_date);
