# Industrial Audit — AI Agent Context

## Project Overview

Industrial audit management system. Express 5 + TypeScript + Prisma 6 backend, React 19 + Vite + Tailwind 4 frontend. SQL Server database (legacy ASP.NET membership schema).

## Repository Structure

```
Industrial Audit/
├── api/                          # Backend (Express + TypeScript + Prisma)
│   ├── prisma/
│   │   └── schema.prisma         # 26 models, introspected from SQL Server
│   ├── src/
│   │   ├── server.ts             # Entry point
│   │   ├── app.ts                # Express app setup + route wiring
│   │   ├── config/env.ts         # Env vars loader
│   │   ├── db/
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   ├── seed_simple.ts    # Seeds 6 users into ASP.NET membership
│   │   │   ├── seed_new.ts       # Comprehensive seed (plants, audits, etc.)
│   │   │   └── verify_seed.ts    # Counts records in all tables
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts # requireAuth + requireRole
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts    # POST /auth/register, /login; GET /auth/me, /supervisors
│   │   │   │   └── auth.service.ts   # Register + login via ASP.NET tables (includes plant + mentor)
│   │   │   ├── users/
│   │   │   │   ├── user.routes.ts    # /admin/users CRUD, supervisor assignments, accept/block/delete
│   │   │   │   ├── user.service.ts   # listUsers, getUserById, userHasRole, supervisor management
│   │   │   │   └── supervisor.routes.ts # /supervisor/auditors
│   │   │   ├── audits/
│   │   │   │   ├── audits.routes.ts      # GET/POST /audits, /dashboard, /kpis, /reassign
│   │   │   │   ├── audits.controller.ts  # Orchestration + validation (correct field names)
│   │   │   │   ├── audits.service.ts     # listAudits, deriveAuditStatus, recomputeAuditScore
│   │   │   │   ├── kpis.service.ts       # Full KPI engine (summary, trends, by-auditor/by-plant)
│   │   │   │   └── dto/create-audit.dto.ts
│   │   │   ├── plants/
│   │   │   │   ├── plant.routes.ts       # GET /plants only (CRUD in service exists)
│   │   │   │   ├── plant.controller.ts   # Full CRUD orchestration
│   │   │   │   ├── plant.service.ts      # Full CRUD + dashboard + schedules
│   │   │   │   └── dto/
│   │   │   ├── schedules/
│   │   │   │   ├── schedules.routes.ts   # Full CRUD + /calendar
│   │   │   │   ├── schedules.controller.ts
│   │   │   │   ├── schedules.service.ts
│   │   │   │   └── calendar.service.ts
│   │   │   └── shifts/
│   │   │       └── shifts.routes.ts      # GET /shifts
│   │   └── shared/
│   │       ├── errors/
│   │       │   ├── appError.ts
│   │       │   └── domain-error.ts
│   │       └── types/auth.ts      # Zod schemas for login/register, JwtPayload
│   └── package.json
├── frontend/                      # Vite + React 19 + Tailwind 4
│   └── src/
│       ├── services/api.service.ts  # API client (login, admin, audits, plants, schedules, shifts)
│       ├── pages/admin/             # Admin dashboard (real API calls for all panels)
│       ├── pages/auditor/           # Auditor panels (real API for dashboard + my audits)
│       ├── pages/auth/              # Login + Register
│       ├── components/
│       │   ├── kpi/KPIDashboard.tsx  # Recharts-based KPI dashboard (real API)
│       │   └── dashboard/           # Card, badges, empty state
│       ├── routes/AppRoutes.tsx     # Route definitions + role guards
│       ├── config/roleRoutes.ts     # Role → home route mapping
│       ├── translations.ts          # Bilingual FR/EN
│       └── layouts/DashboardLayout.tsx
└── docker-compose.yml             # SQL Server 2022 on port 1433
```

## Database Architecture

### Core Tables
| Table | Prisma Model | Key Notes |
|---|---|---|
| `audits` | `audits` | Fields use camelCase with @map to snake_case. Relations: auditor via `auditorLogin`→`aspnet_Users.UserName` |
| `audit_details` | `audit_details` | Boolean fields: `answerOk`, `answerNok`, `answerNc`, `answerNa`. Has `ponderation` + `eliminatoire` |
| `actions` | `actions` | Linked to audit_details + setts_action_status |
| `schedules` | `schedules` | Linked to plants |
| `plant` | `plant` (singular!) | PK: `idPlant` (Int) |
| `aspnet_Users` | `aspnet_Users` | PK: `UserId` (UUID). Fields: `Name`, `Email`, `UserName`, `passwordHash`, `status` |

### Auth Tables
- `aspnet_Applications` — Application registry (one "development" row required)
- `aspnet_Roles` — Roles: `ADMINISTRATOR`, `AUDITOR`, `SUPERVISOR`
- `aspnet_UsersInRoles` — M2M user ↔ role
- `aspnet_Membership` — Legacy membership data

### Key Schema Rules
- `audits` model has NO `auditorId` or `supervisorId` field — joins to `aspnet_Users` via `auditorLogin` / `supervisorLogin` (which map to `UserName`)
- `aspnet_Users` uses PascalCase field names (`UserId`, `UserName`, `Name`, `Email`) — no `@map`
- All other models use camelCase fields with `@map` to snake_case DB columns
- `plant` model is singular; PK is `idPlant`

## Role Names (Uppercase)
```
ADMINISTRATOR  — full access
AUDITOR        — perform audits
SUPERVISOR     — supervise auditors
```

## API Endpoints

| Path | Method | Auth | Description |
|---|---|---|---|
| `/health` | GET | — | Health check |
| `/auth/login` | POST | — | Login, returns `{ token, user: { id, fullName, username, role } }` |
| `/auth/register` | POST | — | Register (username, email, password, fullName, role, plant, mentorName) |
| `/auth/me` | GET | JWT | Current user profile |
| `/auth/supervisors` | GET | — | List supervisors |
| `/admin/users` | GET | ADMINISTRATOR | List users (optional `?status=` filter) |
| `/admin/users/:id/accept` | PATCH | ADMINISTRATOR | Approve user |
| `/admin/users/:id/block` | PATCH | ADMINISTRATOR | Block user |
| `/admin/users/:id` | DELETE | ADMINISTRATOR | Soft-delete user |
| `/admin/users/:userId/supervisors` | GET | ADMINISTRATOR | Get auditor's supervisor assignments |
| `/admin/users/:userId/supervisors/:plantId` | PUT/DELETE | ADMINISTRATOR | Set/remove auditor supervisor |
| `/audits` | GET | ADMIN/AUDITOR/SUPERVISOR | List audits (`?auditorLogin=&plantId=&status=&supervisorId=&unassignedOnly=`) |
| `/audits/dashboard` | GET | ADMINISTRATOR | Dashboard audit list with derived status |
| `/audits/kpis` | GET | ADMINISTRATOR/SUPERVISOR | Full KPI data (`?plantId=&auditorLogin=&auditType=&from=&to=`) |
| `/audits/:id` | GET | ADMIN/AUDITOR/SUPERVISOR | Audit details with answers + actions |
| `/audits` | POST | ADMINISTRATOR/SUPERVISOR | Create audit (supervisor auto-assigns via JWT) |
| `/audits/:id/details` | POST | ADMINISTRATOR/SUPERVISOR | Bulk create audit details |
| `/audits/:id/reassign` | PATCH | ADMINISTRATOR/SUPERVISOR | Reassign auditor |
| `/schedules` | GET/POST | GET: any auth / POST: ADMIN | Schedule CRUD |
| `/schedules/calendar` | GET | Any auth | Calendar view (`?year=&month=&plantId=`) |
| `/schedules/:id` | GET/PUT/DELETE | GET: any auth / PUT/DEL: ADMIN | Single schedule CRUD |
| `/plants` | GET | Any auth | List plants |
| `/shifts` | GET | Any auth | List shifts |
| `/supervisor/auditors` | GET | SUPERVISOR | Supervisor's team auditors |

## Auditor Login Flow
- Login returns `{ token, user: { id, fullName, username, role } }`.
- `username` is `aspnet_Users.UserName` — used to filter audits via `?auditorLogin=` query param.
- Frontend stores `username` from login response and passes it to API calls.

## Frontend State

| Panel | Data Source | Status |
|---|---|---|
| Admin KPI Dashboard | Real API (`/audits/kpis`) | ✅ Working |
| Admin Audit Management | Real API (create + questions) | ✅ Working |
| Admin Audit Results | Real API (`/audits/dashboard` + `/audits/:id`) | ✅ Working |
| Admin User Management | Real API (CRUD, supervisor assignment) | ✅ Working |
| Admin Schedules | Real API (CRUD via schedules endpoints) | ✅ Working |
| Admin Calendar | Real API (`/schedules/calendar`) | ✅ Working |
| Auditor Dashboard | Real API (`/audits?auditorLogin=`) | ✅ Updated |
| Auditor My Audits | Real API (`/audits?auditorLogin=`, filter by status) | ✅ Updated |
| Auditor Findings | Mock data (TODO) | ❌ Mock |
| Auditor Reports | Mock data (TODO) | ❌ Mock |
| Supervisor Dashboard | Real API (KPIs, audit list, create audit, assign auditors, calendar) | ✅ Complete |
| Supervisor Create Audit | Real API (2-step: create + define questions, assign to team auditor) | ✅ Complete |

## Commands

```bash
cd api
npm install
npx prisma generate        # Generate Prisma Client
npm run dev                # tsx watch src/server.ts
npm run build              # tsc -p tsconfig.json
npm run seed               # tsx src/db/seed_simple.ts
npx tsc --noEmit           # Verify compilation

cd frontend
npm install
npm run dev                # Vite dev server
```

## Coding Conventions
- No JSDoc comments. Minimal inline comments.
- Error handling: custom `AppError` class with `statusCode` + `message`, or `NotFoundError`/`DomainError`/`ForbiddenError` from `domain-error.ts`
- Auth middleware: `requireAuth` + `requireRole([...])` on routes
- Prisma client: imported as singleton from `../../db/prisma`
- Seed scripts in `api/src/db/`, NOT in `api/prisma/`
- Frontend: `api.service.ts` uses raw `fetch()`, no Axios
- JWT payload: `{ userId: string, role: Role }` — stores UserId, not UserName
