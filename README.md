# meditrack
A smart medicine reminder and family care web app that helps patients manage medications, track doses, and stay connected with caregivers.

# MediTrack – Never Miss Your Medicine. Never Care Alone.

Smart medicine reminders and consent-based family care. Next.js + TypeScript + Tailwind + Supabase.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest (reminder + validation logic)
npm run test:e2e   # Playwright production journey
```

No setup is needed for **demo mode**: medicines, dose logs and family invitations are saved in your browser (localStorage), so you can try the whole first milestone immediately.

## First milestone (works now)
1. Open **Medicines**, add a medicine with several reminder times.
2. Open **Settings** and enable notifications, sound, and vibration independently.
3. Set a reminder time one or two minutes from now and keep the tab open.
4. When the reminder appears choose **Taken**, **Snooze** or **Not yet taken**.
5. Watch the dashboard counts, history and weekly chart update.

## Connect Supabase 
1. Create a project at supabase.com.
2. Copy the project URL and publishable key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-sb-publishable-key
   ```
   The older `NEXT_PUBLIC_SUPABASE_ANON_KEY` name is also supported.
3. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor (tables + Row Level Security).
4. Create a private storage bucket `prescriptions`.
5. Replace the localStorage code in `src/services/*` with Supabase queries – the pages and hooks don't need to change.

## Notifications and background reminders

The Settings page keeps browser notifications, sound, volume, and vibration independent:

- Browser notifications require an explicit user click and browser permission.
- Sound starts only after a user interaction because of autoplay policies.
- Vibration is enabled only when the device exposes the Vibration API.
- Foreground reminders use the existing schedule engine and refresh when the tab becomes visible.
- Background reminders use `/public/sw.js`, Web Push subscriptions, a Supabase timezone-aware due-reminder function, and the Vercel Cron route in `vercel.json`.

For push subscriptions and background delivery, add these environment variables to Vercel and local development. Only the `NEXT_PUBLIC_*` values are sent to browsers:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
VAPID_PRIVATE_KEY=your-server-only-vapid-private-key
VAPID_SUBJECT=mailto:alerts@example.com
CRON_SECRET=your-long-random-secret
```

Generate a VAPID pair with `npx web-push generate-vapid-keys`. Never commit the private key or service-role key. Run migrations `001`, `002`, and `003` in Supabase. Vercel Cron must be available on the selected plan; otherwise invoke `/api/push/dispatch-due` every minute from a trusted scheduler with `Authorization: Bearer $CRON_SECRET`.

Closed-browser delivery depends on operating-system support. iOS requires an installed Home Screen web app and user permission; desktop and Android support varies by browser. If a capability is unavailable, the UI reports it instead of claiming success. Family caregiver alerts still require a real authenticated Supabase account and a granted caregiver connection; demo mode remains local-only.

## Deploy to Vercel
1. Push the project root (this folder) to GitHub.
2. Import the repository in Vercel and keep the default Next.js build settings.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` under Vercel **Project Settings → Environment Variables** for Production, Preview, and Development.
4. Add the server-only push variables above for Production.
5. Set the Vercel Root Directory to `meditrack` when the repository contains this project in a nested folder.
6. Redeploy after saving the environment variables and confirm the Cron entry is active.

## Structure
- `src/app` – pages (landing, login, register, dashboard, medicines, schedule, family, history, settings)
- `src/components` – UI, dashboard, medicine form, reminders, family, layout
- `src/hooks` – `use-reminders` (schedule checker, notifications, dose responses), `use-notifications`
- `src/services` – data layer (localStorage now, Supabase next)
- `src/utils` – date/reminder logic and validation (unit-tested)
- `supabase/` – schema, RLS policies, seed
- `docs/PRD.md` – product requirements

## Safety
MediTrack is a reminder and tracking tool. It never recommends doses, never tells anyone to double a dose, and shows unanswered doses as **"Not yet confirmed"**, not "missed". Notification delivery is best-effort and depends on browser, operating-system, permission, and push-service support.
