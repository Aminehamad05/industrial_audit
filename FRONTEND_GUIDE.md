# Frontend Architecture Guide

## Stack
- **React 19** with functional components and hooks
- **Vite 8** build tool, dev server on port 5173
- **TypeScript 6** throughout
- **Tailwind CSS 4** for styling (no CSS modules or styled-components)
- **React Router 7** for client-side routing
- **Recharts** for chart visualizations (admin KPI dashboard)
- **Lucide React** for icons
- **No state management library** — uses React context + localStorage/sessionStorage

---

## Entry Points

```
frontend/src/
├── main.tsx          # Vite entry → renders <App />
├── App.tsx           # Wraps <AppRoutes /> in <LanguageProvider />
├── App.css           # Global styles + Tailwind directives
├── index.css         # Additional base styles
└── vite-env.d.ts     # Vite type declarations
```

---

## Routing & Authentication

### Route Definitions (`routes/AppRoutes.tsx`)

| Path | Component | Guard | Role |
|---|---|---|---|
| `/` | Redirect → `/login` | — | — |
| `/login` | `Login.tsx` | — | — |
| `/register` | `Register.tsx` | — | — |
| `/admin/dashboard` | `AdminDashboard.tsx` | `ProtectedRoute` | `ADMINISTRATOR` |
| `/supervisor/dashboard` | `SupervisorDashboard.tsx` | `ProtectedRoute` | `SUPERVISOR` |
| `/auditor/dashboard` | `AuditorDashboard.tsx` | `ProtectedRoute` | `AUDITOR` |

### Role → Home Route Mapping (`config/roleRoutes.ts`)

```typescript
ADMINISTRATOR → /admin/dashboard
SUPERVISOR    → /supervisor/dashboard
AUDITOR       → /auditor/dashboard
```

Used after login to redirect to the correct dashboard.

### Route Guard (`components/ProtectedRouteProps.tsx`)

Checks:
1. `localStorage.getItem('token') || sessionStorage.getItem('token')` exists
2. `userData.role` is in `allowedRoles`

Fails redirect to `/login`.

---

## State Management

### Language Context (`context/LanguageContext.tsx`)

- Stores `language` (`'fr'` | `'en'`) in React state, persisted to `localStorage` as `hutch_language`
- Provides `t(key)` function that looks up translations from `translations.ts`
- Falls back to the other language's dictionary if key not found, then returns the raw key

### Token & User Storage

All components read token/user from localStorage or sessionStorage depending on "Remember Me" checkbox:

```typescript
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
```

**login response shape** (from backend):
```json
{
  "token": "jwt...",
  "user": {
    "id": "uuid",
    "fullName": "Name",
    "username": "login_name",
    "role": "ADMINISTRATOR"
  }
}
```

**Storage keys**:
- `token` — JWT string
- `user` — JSON of `{ id, fullName, username, role }`
- `hutch_remember_email` — for pre-fill on login page
- `hutch_language` — `'fr'` or `'en'`

---

## Component Tree

```
App
└── LanguageProvider
    └── AppRoutes (BrowserRouter)
        ├── /login → AuthLayout > AuthCard > Logo + Input + form
        ├── /register → AuthLayout > AuthCard > Logo + Input + form
        ├── /admin/dashboard → ProtectedRoute > AdminDashboard
        │   └── DashboardLayout
        │       ├── KPIDashboard (tab: dashboard)
        │       ├── AuditManagementPanel (tab: create_audit)
        │       ├── AuditResultsPanel (tab: audit_results)
        │       ├── UserManagementPanel (tab: users)
        │       ├── SchedulesPanel (tab: schedules)
        │       └── AuditCalendar (tab: calendar)
        ├── /supervisor/dashboard → ProtectedRoute > SupervisorDashboard
        │   └── DashboardLayout
        │       ├── KPIDashboard (tab: dashboard)
        │       ├── SupervisorAssignPanel + audits table (tab: audits)
        │       └── AuditCalendar (tab: calendar)
        └── /auditor/dashboard → ProtectedRoute > AuditorDashboard
            └── DashboardLayout
                ├── AuditorDashboardPanel (tab: dashboard)
                ├── MyAuditsPanel (tab: my_audits)
                ├── FindingsPanel (tab: findings)
                ├── ReportsPanel (tab: reports)
                └── AuditCalendar (tab: calendar)
```

---

## API Client (`services/api.service.ts`)

`BASE_URL` hardcoded to `http://localhost:3000` (also in `frontend/.env`).

Uses raw `fetch()` — no Axios. All methods return `Promise<Response>`.

### Auth
| Method | Endpoint | Notes |
|---|---|---|
| `auth.login(email, password)` | `POST /auth/login` | Tries standard, falls back to `/auth/logMe` for `admin/Welcome` |
| `auth.register(username, email, password, fullName, role, plant, mentorName)` | `POST /auth/register` | |
| `auth.getSupervisors()` | `GET /auth/supervisors` | |

### Admin
| Method | Endpoint | Notes |
|---|---|---|
| `admin.getUsers(status?)` | `GET /admin/users` | Optional `?status=Pending` |
| `admin.approveUser(userId)` | `PATCH /admin/users/:id/accept` | |
| `admin.rejectUser(userId)` | `DELETE /admin/users/:id` | |
| `admin.blockUser(userId)` | `PATCH /admin/users/:id/block` | |
| `admin.unblockUser(userId)` | `PATCH /admin/users/:id/accept` | Same as approve |
| `admin.getSupervisorsForAuditor(userId)` | `GET /admin/users/:userId/supervisors` | |
| `admin.assignSupervisorForPlant(userId, plantId, supervisorId)` | `PUT /admin/users/:userId/supervisors/:plantId` | |
| `admin.removeSupervisorForPlant(userId, plantId)` | `DELETE /admin/users/:userId/supervisors/:plantId` | |

### Audits
| Method | Endpoint | Notes |
|---|---|---|
| `audits.dashboard()` | `GET /audits/dashboard` | Admin only |
| `audits.kpis(params?)` | `GET /audits/kpis` | Filters: plantId, auditorLogin, auditType, from, to |
| `audits.list(params?)` | `GET /audits` | Filters: status, auditorLogin, supervisorId, unassignedOnly |
| `audits.getById(id)` | `GET /audits/:id` | Includes details + actions |
| `audits.create(data)` | `POST /audits` | |
| `audits.createDetails(auditId, details)` | `POST /audits/:id/details` | Bulk create audit questions |
| `audits.reassign(auditId, auditorId)` | `PATCH /audits/:id/reassign` | |

### Other
| Method | Endpoint |
|---|---|
| `schedules.list(plantId?)` | `GET /schedules` |
| `schedules.calendar({ year, month, plantId })` | `GET /schedules/calendar` |
| `schedules.get(id)` | `GET /schedules/:id` |
| `schedules.create(data)` | `POST /schedules` |
| `schedules.update(id, data)` | `PUT /schedules/:id` |
| `schedules.delete(id)` | `DELETE /schedules/:id` |
| `plants.list()` | `GET /plants` |
| `shifts.list()` | `GET /shifts` |
| `supervisor.getAuditors()` | `GET /supervisor/auditors` |

---

## Pages & Panels

### AUTH

#### `Login.tsx`
- Fields: email, password, remember-me checkbox
- Validates: email format / not empty, password min 8 chars
- Calls `api.auth.login()`
- On success: stores token + user JSON in localStorage or sessionStorage, redirects via `getHomeRouteForRole(role)`
- `api.auth.getSupervisors()` called during registration only

#### `Register.tsx`
- Fields: fullName, username, email, password, confirmPassword, role (select), plant (select), supervisor (select, visible only for Auditor role)
- Loads plants + supervisors on mount
- Calls `api.auth.register()` with role uppercased
- On success: redirects to `/login`
- Validates: all fields, password match, plant required, supervisor required for Auditor

### ADMIN DASHBOARD (`pages/admin/AdminDashboard.tsx` → `AdminHome`)

Tabs: **Dashboard**, **Create Audit**, **Audit Results**, **Users**, **Schedules**, **Calendar**

#### AdminKPIPanel (tab: dashboard)
Renders `<KPIDashboard welcomeName={fullName} roleLabel="Administrator" />`.

#### KPIDashboard (`components/kpi/KPIDashboard.tsx`)
- **Data source**: Real API — calls `api.audits.kpis()` with optional filters (plantId, auditType, from, to)
- **Response shape**: Returns a `KpiData` object with:
  - `summary`: total, completed, missed, upcoming, inProgress, eliminated, passed, passRate, avgScore
  - `completionBreakdown`: completed, missed, upcoming, inProgress, eliminated
  - `scoreTrend`: array of monthly `{ period, avgScore, passCount, failCount, eliminatedCount }`
  - `byAuditor`: auditor performance stats
  - `byPlant`: plant-level stats
  - `recurringFailures`: top 10 most-failed questions across all audits
  - `alerts`: critical/warning alerts for low-scoring plants/auditors
- **Renders**: loading spinner, error banner, alert cards, 5 KPI cards (total, pass rate, avg score, missed, eliminated), score trend chart (ComposedChart), completion breakdown (PieChart), by-plant bar chart, by-auditor area chart, recurring failures table
- **Filters**: plant dropdown, audit type text input, date range (from/to)

#### AuditManagementPanel (tab: create_audit)
Two-step flow:
1. **Create audit form**: audit type, target, plant, supervisor (required), shift, start date — calls `api.audits.create()`
2. **Define questions**: groups with bilingual (FR/EN) names, questions with bilingual text — calls `api.audits.createDetails()`

#### AuditResultsPanel (tab: audit_results)
- **Data source**: `api.audits.dashboard()` for the list, `api.audits.getById(id)` for detail drill-down
- Shows: audit type, target, plant, auditor, date, score, status
- Drill-down: shows all question groups with answers (OK/NOK/NC/NA badges), comments, photo paths

#### UserManagementPanel (tab: users)
- **Data source**: `api.admin.getUsers(status)` with filter buttons (All/Pending/Active/Blocked/Rejected)
- Shows: full name, email, role, status badge, registration date
- Actions: approve (PATCH accept), block (PATCH block), reject (DELETE), assign supervisors (modal)
- Supervisor assignment modal: shows plants list, current assignments, dropdown to set/clear supervisor per plant

#### SchedulesPanel (tab: schedules)
- **Data source**: `api.schedules.list()` for CRUD table
- Create/edit modal: schedule name, audit type, date, plant, auditor, target, section
- Delete with confirmation

#### AuditCalendar (tab: calendar)
- **Data source**: `api.schedules.calendar({ year, month, plantId })`
- Month grid, nav arrows, shows schedules + audit events with state colors
- Legend: planned (slate), in_progress (blue), done (emerald), failed_ko (red)

### SUPERVISOR DASHBOARD (`pages/SupervisorDashboard.tsx`)

Tabs: **Dashboard**, **Create Audit**, **Audits Supervised**, **Calendar**

#### Dashboard tab
- `<KPIDashboard scoped />` — same KPI component but scoped to the supervisor's auditors (backend filters by `supervisorId` from JWT)

#### Create Audit tab
- `<SupervisorCreateAuditPanel />` — two-step flow identical to admin's audit creation
- **Step 1 (create)**: audit type, target, plant, shift, start date + auditor selector populated from `api.supervisor.getAuditors()` (only their team members)
- No supervisor dropdown — the backend auto-assigns the logged-in supervisor via JWT (`req.user.userId`)
- Optionally assigns an auditor on creation; backend validates the auditor is in the supervisor's team
- **Step 2 (questions)**: groups with bilingual FR/EN names + questions, same UI as admin's `AuditManagementPanel`
- Calls `api.audits.create()` and `api.audits.createDetails()` (both now allow `SUPERVISOR` role)

#### Audits Supervised tab
- **SupervisorAssignPanel**: fetches `api.audits.list({ unassignedOnly: true })` + `api.supervisor.getAuditors()`, allows assigning unassigned audits to team auditors
- **Audits table**: fetches `api.audits.list({ supervisorId })` with status filter (All/upcoming/in_progress/completed/failed/missed)
- Drill-down modal: shows score, status, plant, pass/fail, comment, all question answers with bilingual display, KO badge for eliminatoire

### AUDITOR DASHBOARD (`pages/auditor/AuditorHome.tsx`)

Tabs: **Dashboard**, **My Audits**, **Findings**, **Reports**, **Calendar**

#### AuditorDashboardPanel (tab: dashboard)
- **Data source**: `api.audits.list({ auditorLogin: username })` — reads `username` from stored user data
- Computes: assigned (total), completed, pending, missed counts
- Shows: welcome header, 4 KPI cards, upcoming audits list (sorted by date), recent audits with scores

#### MyAuditsPanel (tab: my_audits)
- **Data source**: `api.audits.list({ auditorLogin: username, status })`
- Filters: All, Planned, In Progress, Completed, Missed (maps API derivedStatus: Upcoming→Planned, InProgress→In Progress, Completed→Completed, Missed→Missed)
- Shows: audit type, target, plant#, shift, date, status badge

#### FindingsPanel (tab: findings)
- **Data source**: **Mock** (`mockFindings` from `mockAuditorData.ts`)
- TODO: Needs real API endpoint for findings

#### ReportsPanel (tab: reports)
- **Data source**: **Mock** (`mockReports` from `mockAuditorData.ts`)
- TODO: Needs real API endpoint for reports

---

## Reusable Components

### Layout
- `AuthLayout` — full-page layout with industrial-themed SVG background, LanguageToggle fixed bottom-right
- `AuthCard` — centered card container with shadow and border
- `DashboardLayout` — header with logo, user avatar, tab navigation, logout button, LanguageToggle fixed bottom-right

### UI
- `Logo` — displays `/logo.png` at 240px width
- `Input` — reusable input with label, error state, show/hide password toggle
- `LanguageToggle` — FR/EN toggle button group (used in AuthLayout + DashboardLayout)
- `ProtectedRouteProps` — route guard checking token and role

### Dashboard
- `Card` — KPI card with title, value, colored accent bar (blue/emerald/amber/rose)
- `StatusBadge` — user status (Pending/Active/Blocked/Rejected)
- `SeverityBadge` — finding severity (Low/Medium/High/Critical)
- `FindingStatusBadge` — finding status (Open/In Review/Closed)
- `AnswerBadge` — answer type (OK/NOK/NC/NA)
- `EmptyState` — empty state placeholder with icon, title, description

### Charts
- `KPIDashboard` — fully featured dashboard with Recharts (AreaChart, BarChart, ComposedChart, PieChart)

### Calendar
- `AuditCalendar` — month grid with schedule/audit events, state colors, plant filter

### Supervisor
- `SupervisorAssignPanel` — assign unassigned audits to team auditors
- `SupervisorCreateAuditPanel` — two-step audit creation with auditor assignment (team members only)

---

## Translation System (`translations.ts`)

693 translation keys in two languages (fr/en). Keys are used via `t('key')` from `useLanguage()` hook.

**Key naming conventions**:
- `err_*` — error messages
- `success_*` — success messages
- `btn_*` — button labels
- `col_*` — table column headers
- `tab_*` — dashboard tab names
- `role_*` — role names
- `audit_status_*` — audit status labels
- `kpi_*` — KPI-related labels
- `finding_*` — finding-related labels
- `report_*` — report-related labels

If a translation key is missing, the hook returns the key string itself as fallback.

---

## State of Completion

| Panel | Data | Status |
|---|---|---|
| Admin KPI Dashboard | Real API (`/audits/kpis`) | ✅ Complete |
| Admin Audit Creation | Real API (`POST /audits`, `/audits/:id/details`) | ✅ Complete |
| Admin Audit Results | Real API (`/audits/dashboard`, `/audits/:id`) | ✅ Complete |
| Admin User Management | Real API (`/admin/users` CRUD) | ✅ Complete |
| Admin Schedules | Real API (CRUD + calendar) | ✅ Complete |
| Admin Calendar | Real API (`/schedules/calendar`) | ✅ Complete |
| Auditor Dashboard | Real API (`/audits?auditorLogin=`) | ✅ Complete |
| Auditor My Audits | Real API (`/audits?auditorLogin=&status=`) | ✅ Complete |
| Auditor Findings | Mock data (`mockAuditorData.ts`) | ❌ Needs API |
| Auditor Reports | Mock data (`mockAuditorData.ts`) | ❌ Needs API |
| Supervisor Dashboard KPIs | Real API (`/audits/kpis` scoped) | ✅ Complete |
| Supervisor Audit Assign | Real API (assign unassigned to team) | ✅ Complete |
| Supervisor Create Audit | Real API (2-step: create + define questions, assign to team auditor) | ✅ Complete |
| Supervisor Audits Table | Real API (`/audits?supervisorId=`) | ✅ Complete |
| Supervisor Calendar | Real API (`/schedules/calendar`) | ✅ Complete |
| Login | Real API (`/auth/login`) | ✅ Complete |
| Register | Real API (`/auth/register`) | ✅ Complete |

---

## Key Patterns to Follow When Adding Features

1. **New API endpoint**: Add method in `api.service.ts` with the naming convention `api.module.action()`
2. **New page/panel**: Create in `pages/role/`, add route in `AppRoutes.tsx`, add tab in the parent dashboard
3. **New translation key**: Add to both fr/en dictionaries in `translations.ts`
4. **Protected endpoint**: Always include `Authorization: Bearer ${token}` header, pulling from localStorage/sessionStorage
5. **Role check**: Use `ProtectedRoute` for route-level guard, or check `userData.role` for conditional rendering
6. **Language support**: Use `t('key')` for all user-visible strings, provide both FR and EN translations
7. **Error handling**: Catch API errors, display via `errorMsg` state + red banner div
8. **Loading states**: Show spinner while API calls are in-flight
