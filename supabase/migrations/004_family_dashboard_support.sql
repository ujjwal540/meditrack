-- Family dashboard support. Existing RLS policies remain the source of truth:
-- patients manage their own connections; caregivers only see invitations and
-- data after the patient grants consent.

alter table public.caregiver_connections
  add column if not exists caregiver_name text;

create index if not exists caregiver_connections_email_status_idx
  on public.caregiver_connections (caregiver_email, consent_status);

create index if not exists dose_logs_status_recorded_at_idx
  on public.dose_logs (status, recorded_at);
