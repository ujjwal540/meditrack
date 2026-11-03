# MediTrack

**Never miss your medicine. Never care alone.**

MediTrack is an accessible, responsive medicine reminder and family-care web app for patients, older adults, and caregivers. It helps users organize medicine schedules, confirm doses, review adherence, and share authorized updates with trusted family members.

## What is implemented

### Medicine management

- Add, edit, view, and delete medicines.
- Store dosage, instructions, medicine type, notes, start date, optional end date, and multiple daily reminder times.
- Prevent duplicate reminder times for the same medicine.
- View medicine details, the next reminder, outstanding doses, and medicine-specific history.

### Reminders and dose tracking

- Dashboard with today's progress, remaining doses, next reminder, and schedule.
- Reminder modal with **Taken**, **Snooze**, and **Not yet taken** actions.
- Configurable snooze length: 5, 10, 15, or 30 minutes.
- Dose records use a unique medicine/date/time key to prevent duplicate logs.
- Unanswered doses are shown as **Not yet confirmed**, never automatically as “missed”.
- Dedicated schedule and history pages, including filtered history for one medicine.
- Weekly adherence chart and daily completion percentage.

### Notifications and assistance

- Browser notification permission and test notification.
- Independent controls for browser notifications, sound, volume, vibration, and voice assistance.
- Web Speech voice summaries and reminder confirmations where supported.
- Sound and vibration capability detection with separate test controls.
- Foreground reminders refresh when the tab becomes visible.
- Easy Mode, high contrast, larger controls, and a mobile-friendly bottom navigation.

### Family Care

- Invite a trusted caregiver by email and optional name.
- Accept, grant, revoke, or remove a caregiver connection.
- Patient-controlled consent: caregivers only see shared updates after permission is granted.
- Authenticated caregivers can view shared medicine activity and unconfirmed doses.
- Configurable caregiver grace period: 15, 30, 45, or 60 minutes.
- Demo-mode family invitations are stored locally; real cross-account sharing requires Supabase Auth.

### Accounts and infrastructure

- Supabase email/password registration and login.
- Patient or family-caregiver account type selection.
- Optional demo mode when Supabase is not configured.
- Supabase PostgreSQL schema with Row Level Security for users, medicines, schedules, dose logs, family connections, documents, and push data.
- Private `prescriptions` storage bucket with per-user object policies.
- Web Push subscription endpoint and timezone-aware due-reminder scheduler.
- Server-only dispatch endpoint suitable for a trusted external scheduler or supported Vercel Cron plan.

> Prescription storage and database structures are prepared in Supabase migrations, but the current UI does not provide prescription upload or OCR. Medicine entry remains manual and must be verified by the user.

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Supabase Auth, PostgreSQL, Row Level Security, and Storage
- Recharts
- Web Push
- Vitest and Testing Library
- Playwright

## Quick start

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available scripts:

```bash
npm run dev        # Start the development server
npm run build      # Create a production build
npm start          # Start the production server
npm run lint       # Run ESLint
npm test           # Run unit/component tests with Vitest
npm run test:watch # Run Vitest in watch mode
npm run test:e2e   # Run Playwright end-to-end tests
```

## Demo mode

No backend setup is required to try the core experience. Without Supabase environment variables:

- Medicines, dose logs, settings, and demo family invitations are stored in the browser's `localStorage`.
- The dashboard, schedule, reminders, history, charts, accessibility controls, and notification tests can be explored locally.
- Data is device- and browser-specific and is not shared with caregivers.
- Background push delivery and authenticated family activity are unavailable.

Try the core flow:

1. Open **Medicines** and add a medicine with one or more reminder times.
2. Set a reminder one or two minutes ahead and keep the tab open.
3. Use **Taken**, **Snooze**, or **Not yet taken** when the reminder appears.
4. Review the dashboard, **Today's timetable**, **Health**, and **History** pages.
5. Open **Settings** to test notifications, sound, voice, vibration, Easy Mode, and contrast.

## Environment variables

Copy `.env.example` to `.env.local` and add the values needed for your deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-vapid-key

# Server-only: never expose these with NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_SUBJECT=mailto:alerts@example.com
CRON_SECRET=your-long-random-secret
```

The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable is also supported by the client configuration. Only the Supabase URL, publishable key, and VAPID public key may be sent to the browser. Never commit service-role, private VAPID, or cron secrets.

Generate a VAPID key pair with:

```bash
npx web-push generate-vapid-keys
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Configure **Authentication → URL Configuration**:
   - Set the Site URL to the deployed application URL.
   - Add local and deployed redirect URLs, such as `http://localhost:3000/**` and `https://your-app.vercel.app/**`.
3. Configure a custom SMTP provider under **Authentication → SMTP Settings** for production email limits.
4. Run these migrations in order in the Supabase SQL Editor:

   ```text
   001_initial_schema.sql
   002_push_notifications.sql
   003_background_reminder_scheduler.sql
   004_family_dashboard_support.sql
   005_security_hardening.sql
   ```

   They create the core schema, consent policies, push subscription tables, scheduler function, family dashboard support, private prescription storage, and scheduler security restrictions.
5. Keep email confirmation enabled for production. Users must confirm their email before signing in when confirmation is required.
6. Add the environment variables above to local development and the deployment platform.

The current medicine and reminder services use local storage by design. Supabase-backed family connections, authenticated caregiver activity, and push infrastructure are available when Supabase is configured. Migrating medicine and dose services to Supabase can be done without changing the page and hook interfaces.

## Background push reminders

Foreground reminders work while MediTrack is open. Background delivery additionally requires:

- HTTPS and a browser/service worker that supports Web Push.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the browser environment.
- `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and `CRON_SECRET` on the server only.
- Supabase migrations `001` through `005`.
- A trusted scheduler that calls `POST /api/push/dispatch-due` every minute with:

  Send the `CRON_SECRET` as a bearer token in the `Authorization` header.

- A signed-in user who has granted notification permission and registered a push subscription.

The endpoint claims each due reminder before sending it, removes expired subscriptions, and returns the number of due reminders and notifications sent. Vercel Hobby does not support the every-minute schedule needed for timely reminders, so no cron job is declared by default; use a trusted external scheduler or a Vercel plan that supports the required frequency.

Closed-browser delivery depends on operating-system and browser support. iOS generally requires an installed Home Screen web app and user permission. MediTrack reports unsupported capabilities instead of claiming delivery.

## Application routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Supabase login or demo continuation |
| `/register` | Patient/caregiver registration |
| `/dashboard` | Daily progress, next dose, reminders, and shortcuts |
| `/medicines` | Add, edit, inspect, and delete medicines |
| `/schedule` | Today's ordered dose timetable |
| `/health` | Daily progress and weekly adherence chart |
| `/history` | Dose response history, optionally filtered by medicine |
| `/family` | Invitations, consent, caregiver activity, and alerts |
| `/settings` | Accessibility, reminder, sound, voice, vibration, and push settings |

API routes:

- `POST /api/push/subscribe` validates an authenticated user's push subscription and saves its timezone.
- `POST /api/push/dispatch` provides the configured push dispatch operation.
- `POST /api/push/dispatch-due` claims and sends due reminders for a trusted scheduler.

## Project structure

```text
src/
  app/                 App Router pages and push API routes
  components/          Auth, layout, dashboard, medicine, family, UI, and reminders
  hooks/               Reminder, notification, and voice behavior
  lib/                 Supabase clients, auth, and shared utilities
  services/            Medicine, schedule, caregiver, and health data services
  types/               Shared domain types
  utils/               Date, validation, and sound helpers
public/
  sw.js                Web Push service worker
  images/              Accessible product illustrations
supabase/
  migrations/          Ordered database, RLS, storage, and scheduler migrations
  seed.sql              Development seed data
tests/                 Unit and component tests
e2e/                   Playwright user journeys
docs/PRD.md            Product requirements and planned capabilities
```

## Deploy to Vercel

1. Push the project root to GitHub.
2. Import it into Vercel as a Next.js project.
3. Keep the Root Directory as `./` when this folder is the repository root.
4. Add the public Supabase variables for Production, Preview, and Development.
5. Add the server-only push variables for Production.
6. Configure Supabase Site URL and Redirect URLs for the deployed domain.
7. Redeploy after saving environment variables.
8. Configure a trusted external scheduler if background push delivery is required on Vercel Hobby.

## Safety and privacy

MediTrack is a tracking and reminder tool, not a medical decision system. It:

- Never recommends a dose or instructs a user to double a dose.
- Treats medicine names, dosages, and instructions as user-entered information.
- Requires user action to confirm a dose.
- Uses consent-based caregiver access.
- Protects Supabase tables with Row Level Security and prescription objects with a private bucket.
- Provides best-effort notifications only; browser, OS, permission, connectivity, and push-service support can affect delivery.

Always follow instructions from a qualified healthcare professional.
