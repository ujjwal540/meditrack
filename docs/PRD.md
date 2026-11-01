# MediTrack – Product Requirements Document (PRD)

**Smart Medicine Reminder & Family Care System**
*Never Miss Your Medicine. Never Care Alone.*

| Detail | Value |
|---|---|
| Product | MediTrack |
| Version | MVP v1.0 |
| Category | Digital Healthcare |
| Platform | Responsive website |
| Target users | Patients, elderly people, families |
| Development target | 5 days |
| Frontend | Next.js + TypeScript |
| Backend | Supabase |
| Database | PostgreSQL |
| Deployment | Vercel |

---

## 1. Product Overview

MediTrack is a medicine reminder and family care web application that helps people take prescribed medicines on time. Users add medication schedules manually or upload prescriptions, receive reminders, track dose status, and connect family members or caregivers.

It focuses on older adults, patients managing multiple medicines, and families who want to support loved ones.

## 2. Problem Statement

- Older people forget to take medicines on time.
- Patients on multiple medicines get confused about schedules.
- Family members cannot continuously monitor elderly relatives.
- Patients forget whether they already took a dose.
- Paper prescriptions and schedules get lost.
- Families do not know when a dose remains unconfirmed.

**Solution:** one platform for medication scheduling, reminders, dose tracking and consent-based family monitoring.

## 3. Product Objectives

1. Help users remember prescribed medication schedules.
2. Reduce confusion around multiple medicine schedules.
3. Let users track medication history.
4. Enable families to support elderly members.
5. Make prescription information easier to organize.
6. Provide a simple, accessible healthcare interface.

## 4. Target Audience

| User | Needs |
|---|---|
| Elderly people | Simple medicine reminders |
| Patients | Organized medicine schedules |
| Family members | Monitor shared medication status |
| Caregivers | Help patients manage medicines |
| General users | Remember daily medication |

## 5. User Roles

**Patient** – add medicines, upload prescriptions, set reminders, mark doses taken, view history, invite family members.

**Family member / Caregiver** – accept invitations, view shared schedules, see confirmed and unconfirmed doses, receive authorized notifications.

**Administrator** – manage accounts, monitor operations, handle support, review system activity without unnecessarily accessing private medical records.

## 6. Functional Requirements

| ID | Feature | Requirement | Priority |
|---|---|---|---|
| FR-01 | Registration | Users can create accounts | High |
| FR-02 | Login | Users can securely log in | High |
| FR-03 | Medicine management | Add, edit and delete medicines | High |
| FR-04 | Medicine schedule | Set multiple reminder times | High |
| FR-05 | Notifications | Display reminders at scheduled times | High |
| FR-06 | Dose tracking | Mark Taken, Snooze or Not Yet Confirmed | High |
| FR-07 | Prescription upload | Upload image or PDF | High |
| FR-08 | Family connection | Invite and connect caregivers | High |
| FR-09 | Family monitoring | View shared dose status | High |
| FR-10 | Medication history | View previous dose records | High |
| FR-11 | Dashboard | Display daily medication progress | High |
| FR-12 | Profile | Update personal information | Medium |
| FR-13 | Analytics | Show adherence statistics | Medium |
| FR-14 | Push notifications | Background reminders | Future |
| FR-15 | OCR | Extract prescription information | Future |

## 7. Detailed Feature Requirements

### 7.1 User Authentication
- Register with name, email and password.
- Log in and log out.
- Reset forgotten passwords.
- Manage profile information.
- Implemented with Supabase Auth.

### 7.2 Medicine Management

| Field | Description |
|---|---|
| Medicine name | Name of prescribed medicine |
| Dosage | Prescribed dosage |
| Instructions | Instructions from a healthcare professional |
| Start date | Schedule start date |
| End date | Schedule end date, if applicable |
| Reminder times | One or more daily times |
| Notes | Optional additional information |

The system must **not** recommend or automatically modify medication dosage.

### 7.3 Smart Medicine Reminder
When the scheduled time arrives, the app checks the schedule, displays the reminder with medicine name and instructions, and lets the user choose an action:

- **Taken** – record dose confirmation.
- **Snooze** – remind again after a selected interval.
- **Not yet taken** – keep the dose unconfirmed.

The system must avoid duplicate reminders and duplicate dose logs. In the MVP, reminders work while the web app is active; reliable background reminders are a future push-notification enhancement.

### 7.4 Prescription Upload
- Upload PDF, JPG and PNG files; reject unsupported types.
- Preview uploaded documents.
- Store documents securely.
- Allow manual entry of medication information.
- Require user verification before a schedule is created.
- OCR is not required in v1.

### 7.5 Family Care Mode
- Patient sends an invitation; family member accepts.
- Patient grants access to specified information.
- Caregiver views authorized schedules and dose confirmation status.
- Caregiver is alerted when a dose remains unconfirmed after a configured grace period.
- An unconfirmed dose is shown as **"Not yet confirmed"**, never automatically as "missed".

### 7.6 Medication History
Medicine name, scheduled time, actual confirmation time, dose status, and daily/weekly views.

### 7.7 Dashboard
Total scheduled doses today, confirmed doses, pending doses, next reminder, medicine list, family connection status, weekly adherence chart.

## 8. Non-Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| NFR-01 | Performance | Fast loading and responsive navigation |
| NFR-02 | Security | Protected authentication and authorization |
| NFR-03 | Privacy | Patient-controlled sharing |
| NFR-04 | Accessibility | Readable text and clear controls |
| NFR-05 | Reliability | Prevent duplicate reminder records |
| NFR-06 | Compatibility | Desktop, tablet and mobile browsers |
| NFR-07 | Scalability | Support future mobile applications |
| NFR-08 | Backup | Regular database backups |
| NFR-09 | Maintainability | Modular project architecture |
| NFR-10 | Auditability | Track sensitive record access |

## 9. User Workflow

```
Start → Register/Login → Patient Dashboard → Choose Action
  ├─ Add Medicine → Enter Details → Preview & Verify → Set Reminder Times → Save Schedule
  ├─ Upload Prescription → Preview → Manually Verify → Save Schedule
  └─ Connect Family → Invite → Accept → Patient Grants Consent

Saved Schedule → Database → Reminder System → Display Reminder → User Action
  ├─ Taken → Save Dose Log
  ├─ Snooze → Reschedule Reminder
  └─ Unconfirmed → Wait Grace Period → Notify Caregiver (if authorized)
→ Update Dashboard
```

## 10. System Architecture

```
Patient / Caregiver
      │
Next.js Frontend
      │  (Auth · Medicine · Reminder · Family · Document modules)
      │
Supabase ── Auth
         ├─ PostgreSQL Database
         └─ Storage
      │
Browser Notifications API  (future: Email / Push service)
```

## 11. Database Requirements

| Table | Purpose | Key fields |
|---|---|---|
| users | Account information | id, name, email, role |
| medicines | Medicine details | id, patient_id, medicine_name, dosage, instructions |
| medicine_schedules | Reminder times | id, medicine_id, reminder_time, start_date, end_date |
| dose_logs | Confirmation history | id, schedule_id, scheduled_at, status, recorded_at |
| caregiver_connections | Relationships and consent | id, patient_id, caregiver_id, consent_status |
| documents | Prescription metadata | id, patient_id, file_path, document_type |

**Relationships:** one patient → many medicines; one medicine → many schedules; one schedule → many dose logs; one patient → many caregivers; one user → many documents.

All tables need foreign keys, timestamps and **Row Level Security**: patients access only their own records; caregivers access only records explicitly shared with them. Add a unique constraint on `(schedule_id, scheduled_at)` in `dose_logs` to prevent duplicate dose records.

## 12. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| Backend services | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Notifications | Browser Notifications API |
| Charts | Recharts |
| Testing | Vitest + Playwright |
| Version control | GitHub |
| Deployment | Vercel |

No third-party API is required for the MVP.

## 13. UI/UX Requirements

Simple enough for elderly users, polished enough for a professional demo.

**Key screens:** patient dashboard, medicine schedule, family care dashboard, prescription locker.

| Element | Value |
|---|---|
| Primary color | #0D9488 |
| Secondary color | #2563EB |
| Background | #F8FAFC |
| Font | Inter |
| Card radius | 16px |
| Buttons | Large and accessible |
| Style | Minimal and modern |

**Accessibility:** large buttons, clear labels, readable typography, high contrast, status never conveyed by color alone, full keyboard navigation.

## 14. Testing Requirements

| Test ID | Scenario | Expected result |
|---|---|---|
| TC-01 | Register account | Account created |
| TC-02 | Login | User authenticated |
| TC-03 | Add medicine | Medicine saved |
| TC-04 | Add multiple times | All schedules saved |
| TC-05 | Reminder trigger | Correct reminder appears |
| TC-06 | Mark Taken | Dose status updated |
| TC-07 | Snooze | Reminder delayed correctly |
| TC-08 | Upload prescription | File stored securely |
| TC-09 | Connect caregiver | Invitation accepted |
| TC-10 | Unauthorized access | Access denied |
| TC-11 | Mobile screen | Layout responsive |
| TC-12 | Duplicate reminder | No duplicate dose record |

Additional checks: past schedules don't trigger reminders, unsupported upload types are rejected, time zones are handled correctly, caregivers cannot view records without consent.

## 15. DevOps and Deployment

```
VS Code → Git → GitHub → GitHub Actions (lint + tests + build) → Vercel → Live site
                                                                   ↕
                                                     Supabase (DB + Storage)
```

- Source code on GitHub; local secrets in `.env.local`; production secrets in Vercel.
- Enable Supabase RLS; use a staging environment; maintain backups.
- Test the live website before the presentation.

## 16. Project Timeline

| Day | Focus | Deliverable |
|---|---|---|
| 1 | Setup and frontend | Project init, landing page, login, dashboard UI |
| 2 | Medicine management | Add medicine, schedules, reminders, dose tracking |
| 3 | Database and family | Supabase, tables, auth, caregiver invitations |
| 4 | Complete and test | Uploads, responsive UI, history, charts, tests |
| 5 | Deploy and demonstrate | Live site, sample accounts, presentation |

## 17. MVP Scope vs Future Scope

| Feature | MVP v1.0 | Future v2.0 |
|---|---|---|
| Medicine management | Yes | Advanced |
| Manual scheduling | Yes | Yes |
| Reminders | Browser | Push |
| Prescription upload | Yes | OCR extraction |
| Dose tracking | Yes | Advanced analytics |
| Family care | Basic | Advanced |
| Android / iOS apps | No | Yes |
| AI features | No | Optional |
| SMS reminders | No | Yes |

## 18. Success Criteria

1. A user can register and log in.
2. A patient can add and save medicines.
3. A patient can create multiple daily reminders.
4. Reminders appear at configured times while the app is active.
5. Patients can record dose status.
6. Patients can upload prescription documents.
7. A caregiver can connect with patient consent.
8. Caregivers can view shared medication status.
9. The website works on desktop and mobile.
10. The application is deployed and demo-ready.

## 19. Risks and Limitations

| Risk | Mitigation |
|---|---|
| Browser closed | Explain limitation; add push infrastructure later |
| Incorrect prescription entry | Require user verification |
| Internet unavailable | Show connectivity status; plan offline support |
| Privacy breach | RLS, encryption, access auditing |
| Wrong medicine schedule | Never infer or prescribe doses |
| Elderly users struggle with UI | Large text, simple navigation, usability testing |

> **Safety statement:** MediTrack is a reminder and tracking tool, not a medical decision-maker. It must not diagnose illnesses, recommend doses, tell patients to double a dose after a missed reminder, or change prescriptions. Missed-dose decisions must be referred to the prescription instructions or a healthcare professional.

## 20. Future Business Opportunity

Free for individual patients, with optional paid services: premium family accounts, clinic subscriptions, caregiver management plans, healthcare organization licensing. Validate demand and pricing before any commercial launch.

## 21. Build Order

1. Next.js project setup
2. Landing page and patient dashboard
3. Add Medicine form
4. Schedule and reminder logic
5. Taken / Snooze tracking
6. Supabase database
7. Family Care Mode
8. Testing and deployment

**First milestone:** a dashboard where a user can add a medicine, set multiple daily reminder times, receive a reminder, and mark it as taken.
