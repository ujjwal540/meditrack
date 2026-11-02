-- Security hardening for existing MediTrack deployments.

-- The scheduler is the only caller of this SECURITY DEFINER function.
revoke execute on function public.get_due_reminders() from public, anon, authenticated;
grant execute on function public.get_due_reminders() to service_role;

-- Keep every medical-data table protected if this migration is applied to an
-- older project where one of the original statements was skipped.
alter table public.users enable row level security;
alter table public.medicines enable row level security;
alter table public.medicine_schedules enable row level security;
alter table public.dose_logs enable row level security;
alter table public.caregiver_connections enable row level security;
alter table public.documents enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.push_deliveries enable row level security;

-- Prescription files must not be publicly readable.
insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', false)
on conflict (id) do update set public = false;

drop policy if exists "own prescription files" on storage.objects;
create policy "own prescription files"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'prescriptions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'prescriptions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
