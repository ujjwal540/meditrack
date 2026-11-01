# MediTrack

## Never Miss Your Medicine. Never Care Alone.

MediTrack is a patient-friendly medication reminder and family-care web application. It helps people organize medicines, track dose confirmations, receive browser alerts, and share care updates with trusted family members.

## Live demo

**Open MediTrack:** [https://meditrack-ukk.vercel.app](https://meditrack-ukk.vercel.app)

Useful demo pages:

- [Dashboard](https://meditrack-ukk.vercel.app/dashboard)
- [Medicines](https://meditrack-ukk.vercel.app/medicines)
- [Schedule](https://meditrack-ukk.vercel.app/schedule)
- [Family Care](https://meditrack-ukk.vercel.app/family)
- [History](https://meditrack-ukk.vercel.app/history)
- [Settings](https://meditrack-ukk.vercel.app/settings)
- [Login](https://meditrack-ukk.vercel.app/login)
- [Register](https://meditrack-ukk.vercel.app/register)

The demo works in a modern browser without an account. Demo medicines, dose logs, settings, and family invitations are stored in that browser using `localStorage`.

## Features

- Add medicines with dosage, instructions, notes, start dates, end dates, and multiple reminder times.
- View today’s medication schedule and upcoming doses.
- Mark a dose as **Taken**, **Snoozed**, or **Not yet confirmed**.
- See adherence statistics, history, and a weekly progress chart.
- Enable browser notifications, sound alerts, and vibration where supported by the browser and device.
- Set snooze and caregiver grace-period preferences.
- Add trusted family caregivers with consent status tracking.
- Use a responsive interface designed for mobile phones, tablets, and desktop screens.
- Sign in or create an account with Supabase Authentication when Supabase is configured.

## Try the demo

1. Open the [live demo](https://meditrack-ukk.vercel.app).
2. Select **Open dashboard** or open [Medicines](https://meditrack-ukk.vercel.app/medicines).
3. Add a medicine and choose one or more reminder times.
4. Open [Dashboard](https://meditrack-ukk.vercel.app/dashboard) and select **Enable alerts**.
5. Set a reminder one or two minutes ahead and keep the app open.
6. Respond with **Taken**, **Snooze**, or **Not yet taken**.
7. Review the dashboard, schedule, history, and weekly chart.

## Local development

### Requirements

- Node.js 18.18 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Validate the project

```bash
npm test
npm run build
```

`npm test` runs the Vitest reminder and validation tests.

## Environment variables

Copy `.env.example` to `.env.local` and add your Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported for older Supabase projects.

Never commit `.env.local`, private keys, service-role keys, or email-provider API keys. Only public Supabase client values should use the `NEXT_PUBLIC_` prefix.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Add the environment variables above to `.env.local`.
3. Run [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) in the Supabase SQL Editor.
4. Create a private Storage bucket named `prescriptions`.
5. Add the same public environment variables in Vercel under **Settings → Environment Variables**.
6. Redeploy after changing Vercel environment variables.

The current demo data layer uses browser `localStorage`. Supabase Authentication is wired into the login and registration pages; the medicine and caregiver service layers can be connected to the database tables in a future integration step.

## Deploy to Vercel

1. Import [the GitHub repository](https://github.com/ujjwal540/meditrack) into Vercel.
2. Keep the framework preset as **Next.js**.
3. Set the project root to the repository root.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production, Preview, and Development.
5. Deploy or redeploy the project.

## Important limitations

- Browser reminders work while the MediTrack tab is open. Reliable reminders when the browser is closed require a push-notification service.
- Browser sound and vibration depend on device permissions, browser support, volume, and system settings.
- Demo family invitations are saved locally and do not send Gmail messages. Real email delivery requires a secure server-side email provider or Supabase Edge Function.
- MediTrack does not provide medical advice, recommend doses, or tell users to double a dose.

## Project structure

- `src/app` – landing page, authentication, dashboard, medicines, schedule, family, history, and settings pages
- `src/components` – reusable UI, auth, dashboard, medicine, reminder, family, and layout components
- `src/hooks` – reminder scheduling and browser notification behavior
- `src/services` – localStorage data services and future persistence integration points
- `src/utils` – date, reminder, and validation logic
- `supabase/` – database schema and seed data
- `tests/` – Vitest unit tests
- `docs/PRD.md` – product requirements

## Safety

MediTrack is a reminder and tracking tool. It never recommends doses, never tells anyone to double a dose, and shows unanswered doses as **Not yet confirmed**, not **missed**. Always follow the prescription label and contact a doctor or pharmacist when you are unsure.
