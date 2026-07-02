# Industrial Audit API - Backend Guide

## Architecture

```
frontend/ (React 19 + Vite + Tailwind CSS 4)
  └── api.service.ts → fetch() → http://localhost:3000

api/ (Express 5 + TypeScript + Prisma 6)
  ├── /auth       → auth.routes.ts → auth.service.ts    (register, login, me)
  ├── /admin      → user.routes.ts → user.service.ts     (CRUD users)
  ├── /audits     → audits.routes.ts → audits.controller.ts → audits.service.ts
  ├── /plants     → plant.routes.ts → plant.controller.ts → plant.service.ts
  └── Prisma ORM → SQL Server (AuditorExport1)
```

## Database Schema

Tables are SQL Server. The Prisma schema (`api/prisma/schema.prisma`) was generated via `prisma db pull` from an existing database. **26 models** total.

### Core Business Tables

| Model | Purpose |
|---|---|
| `audits` | Main audit records — denormalized auditor/supervisor name, plant, score, dates |
| `audit_details` | Per-question answers within an audit (OK/NOK/NC/NA) |
| `actions` | Corrective actions linked to audit details |
| `schedules` | Scheduled audits |
| `plant` | Plant/site entities (model name is singular `plant`, PK is `idPlant`) |

### Legacy ASP.NET Membership Tables

User management uses the legacy ASP.NET membership system:

| Model | Purpose |
|---|---|
| `aspnet_Users` | **The users table.** PK is `UserId` (UUID). Fields: `UserName`, `Email`, `Name` (full name), `passwordHash`, `status` |
| `aspnet_Membership` | Legacy membership data (passwords, lockout, approval) |
| `aspnet_Roles` | Role definitions — values: `ADMINISTRATOR`, `AUDITOR`, `SUPERVISOR` |
| `aspnet_UsersInRoles` | M2M user-role assignments |
| `aspnet_Applications` | Application registry (required for ASP.NET membership) |

### Settings/Lookup Tables

| Model | Purpose |
|---|---|
| `setts_action_status` | Action status lookup (Open, In Progress, Closed) |
| `setts_audit_types` | Audit type definitions |
| `setts_audit_question_groups` | Question group templates |
| `setts_audit_questions` | Question definitions |
| `setts_audit_targets` | Audit target definitions |
| `setts_auditors` | Auditor assignments |
| `setts_fonctions` | Job functions |
| `setts_services` | Service definitions |
| `setts_schedules` | Schedule definitions |
| `setts_shifts` | Shift definitions |
| `setts_TeamLeader` | Team leaders |
| `Correspondance_User_Plant` | User-plant assignments |
| `AffectationUserUserChef` | User-supervisor assignments |
| `TJ_FonctionUser` | User-function junction |
| `TJ_ServiceUser` | User-service junction |

---

## Known Compilation Errors

Running `npx tsc --noEmit` in `api/` reports **22 errors** in the audits module. Root cause: the audits controller and service were written against a **conceptual clean schema** (with fields like `auditor.id`, `auditor.email`, `auditor.full_name`, `plant.id`) but the **actual database schema** uses legacy ASP.NET field names (`UserId`, `Email`, `Name`, `idPlant`).

### Key Mismatches in `audits.controller.ts`

| Line | Code Uses | Should Be |
|---|---|---|
| 48, 101 | `auditor.role` | `aspnet_Users` has no `role` field (role is in `aspnet_UsersInRoles` → `aspnet_Roles`) |
| 73, 80, 106 | `auditor.id`, `plant.id` | `auditor.UserId`, `plant.idPlant` |
| 74, 78, 106 | `auditor.email` | `auditor.Email` |
| 75, 77, 106 | `auditor.full_name` | `auditor.Name` |

### Other Errors

| File | Issue |
|---|---|
| `audits.service.ts:136` | `createMany` for `audit_details` missing required boolean fields: `answerOk`, `answerNok`, `answerNc`, `answerNa` |
| `audits.controller.ts:17,30,161` | `deriveAuditStatus` expects `startDate: string \| Date` but receives `Date \| null` |

### Known Working Modules

- `auth.service.ts` — correct, uses `prisma.aspnet_Users`, `aspnet_Membership`, `aspnet_Roles`, `aspnet_UsersInRoles`, `aspnet_Applications`
- `user.service.ts` — correct, uses `prisma.aspnet_Users`, `aspnet_Membership`
- `plant.service.ts` — correct, uses `prisma.plant` (singular), `prisma.audits`, `prisma.schedules`
- `seed_simple.ts` — correct, creates users in ASP.NET membership tables via Prisma

---

## Setup

### Prerequisites
- Node.js 16+
- SQL Server (or Docker)
- `AuditorExport1` database must already exist with all tables (schema is introspected, not managed by Prisma migrations)

### Install & Generate
```bash
cd api
npm install
npx prisma generate
```

### Database
The database connection is defined in `api/.env` — points to `AuditorExport1` on `localhost:1433` with `sa` account.

Start SQL Server via Docker:
```bash
cd ..
docker compose up -d
```

### Seed
```bash
npm run seed   # runs tsx src/db/seed_simple.ts
```
Requires an existing `aspnet_Applications` row with `LoweredApplicationName = 'development'` and corresponding `aspnet_Roles` rows.

### Run
```bash
npm run dev    # tsx watch src/server.ts
npm run build  # tsc -p tsconfig.json
npm start      # node dist/server.js
```

---

## Project Status

| Module | Works? | Notes |
|---|---|---|
| Auth (register/login/me) | Yes | Uses ASP.NET membership tables |
| User management (admin) | Yes | Approve, block, delete users |
| Plants (GET) | Yes | Only GET is exposed via routes; full CRUD exists in service |
| Audits (list/get/dashboard) | No | 22 TS errors — field name mismatches with schema |
| Audit creation | No | Same field name mismatches |
| Audit details creation | No | Missing required boolean fields |
| Frontend (admin) | Partial | Real API for audits/users; hardcoded roles |
| Frontend (auditor) | Partial | All panels use mock data from `mockAuditorData.ts` |
| Frontend (supervisor) | No | Placeholder only |
| Seed scripts | Yes | `seed_simple.ts` works; `seed_new.ts` comprehensive but uses singular `plant` model |

---

## Seed Scripts

Located in `api/src/db/`:

| Script | Purpose |
|---|---|
| `prisma.ts` | Prisma client singleton |
| `seed_simple.ts` | Seeds 6 users (2 admin, 2 auditor, 2 supervisor) into ASP.NET membership |
| `seed_new.ts` | Comprehensive seed — plants, users, audits, schedules, question groups |
| `verify_seed.ts` | Counts records in all tables and displays sample data |

---

## Role Names

Database role values are **uppercase**:
- `ADMINISTRATOR`
- `AUDITOR`
- `SUPERVISOR`

Frontend role strings were recently patched to match (commit not yet made). The `api.service.ts` login fallback hardcodes `ADMINISTRATOR`.

---

## Security Notes

- JWT_SECRET in `.env` is a placeholder (`aaaaaaaa...`) — change in production
- DB credentials exposed in `.env` — never commit
- No rate limiting on auth endpoints
- No HTTPS configured
- CORS is wide open
