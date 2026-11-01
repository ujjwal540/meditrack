# meditrack
A smart medicine reminder and family care web app that helps patients manage medications, track doses, and stay connected with caregivers.

# MediTrack – Never Miss Your Medicine. Never Care Alone.

Smart medicine reminders and consent-based family care. Next.js + TypeScript + Tailwind + Supabase.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest (reminder + validation logic)
```

No setup is needed for **demo mode**: medicines, dose logs and family invitations are saved in your browser (localStorage), so you can try the whole first milestone immediately.

## First milestone (works now)
1. Open **Medicines**, add a medicine with several reminder times.
2. Click **Enable notifications** on the Dashboard.
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

## Deploy to Vercel
1. Push the project root (this folder) to GitHub.
2. Import the repository in Vercel and keep the default Next.js build settings.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` under Vercel **Project Settings → Environment Variables** for Production, Preview, and Development.
4. Redeploy after saving the environment variables.

## Structure
- `src/app` – pages (landing, login, register, dashboard, medicines, schedule, family, history, settings)
- `src/components` – UI, dashboard, medicine form, reminders, family, layout
- `src/hooks` – `use-reminders` (schedule checker, notifications, dose responses), `use-notifications`
- `src/services` – data layer (localStorage now, Supabase next)
- `src/utils` – date/reminder logic and validation (unit-tested)
- `supabase/` – schema, RLS policies, seed
- `docs/PRD.md` – product requirements

## Safety
MediTrack is a reminder and tracking tool. It never recommends doses, never tells anyone to double a dose, and shows unanswered doses as **"Not yet confirmed"**, not "missed". Browser reminders only work while the app is open; reliable background reminders need push infrastructure (future work).
