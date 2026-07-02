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
│   │   │   │   ├── auth.routes.ts    # POST /auth/register, /login; GET /auth/me
│   │   │   │   └── auth.service.ts   # Register + login via ASP.NET tables
│   │   │   ├── users/
│   │   │   │   ├── user.routes.ts    # GET /admin/users, PATCH/accept, /block, DELETE
│   │   │   │   └── user.service.ts   # CRUD on aspnet_Users
│   │   │   ├── audits/
│   │   │   │   ├── audits.routes.ts      # GET/POST /audits, /dashboard, /reassign
│   │   │   │   ├── audits.controller.ts  # Orchestration + validation
│   │   │   │   ├── audits.service.ts     # Business logic
│   │   │   │   └── dto/create-audit.dto.ts
│   │   │   └── plants/
│   │   │       ├── plant.routes.ts       # GET /plants only (CRUD in service exists)
│   │   │       ├── plant.controller.ts   # Full CRUD orchestration
│   │   │       ├── plant.service.ts      # Full CRUD + dashboard + schedules
│   │   │       └── dto/
│   │   │           ├── create-plant.dto.ts
│   │   │           └── update-plant.dto.ts
│   │   └── shared/
│   │       ├── errors/
│   │       │   ├── appError.ts
│   │       │   └── domain-error.ts
│   │       └── types/auth.ts      # Zod schemas for login/register
│   └── package.json
├── frontend/                      # Vite + React 19 + Tailwind 4
│   └── src/
│       ├── services/api.service.ts  # Axios-based API client (hardcoded localhost:3000)
│       ├── pages/admin/             # Admin dashboard (real API calls)
│       ├── pages/auditor/           # Auditor panels (mock data only)
│       ├── pages/auth/              # Login + Register
│       ├── components/              # Reusable UI components
│       ├── routes/AppRoutes.tsx     # Route definitions + role guards
│       └── translations.ts          # Bilingual FR/EN (507 lines)
└── docker-compose.yml             # SQL Server 2022 on port 1433
```

## Database Architecture

### Core Tables
| Table | Prisma Model | Key Fields |
|---|---|---|
| `audits` | `audits` (camelCase fields with @map) | `id`, `audit_type`, `auditor_login`, `auditor_full_name`, `start_date`, `end_date`, `idplant` |
| `audit_details` | `audit_details` | `audit_id`, `answer_OK`, `answer_NOK`, `answer_NC`, `answer_NA` (all Boolean, required) |
| `actions` | `actions` | Linked to audit_details + setts_action_status |
| `schedules` | `schedules` | Linked to plants |
| `plant` | `plant` (singular!) | PK: `idPlant` (Int, name `idPlant` in Prisma) |
| `aspnet_Users` | `aspnet_Users` | PK: `UserId` (UUID, field name `UserId`). Fields: `Name`, `Email`, `UserName`, `passwordHash`, `status` |

### Auth Tables (Legacy ASP.NET Membership)
- `aspnet_Applications` — Application registry (one "development" row required)
- `aspnet_Roles` — Roles: `ADMINISTRATOR`, `AUDITOR`, `SUPERVISOR`
- `aspnet_UsersInRoles` — M2M user ↔ role
- `aspnet_Membership` — Legacy membership data

### Key Schema Rules
- Model names match table names directly (no `@@map`), BUT field names are camelCase with `@map` to snake_case columns for most models.
- Exception: `aspnet_Users` uses PascalCase field names (`UserId`, `UserName`, `Name`, `Email`) matching actual column names — no `@map`.
- `plant` model is singular; its PK is `idPlant` (not `id`). The audits relation uses `plantId` → `idPlant`.

## Role Names (Uppercase)
```
ADMINISTRATOR  — full access
AUDITOR        — perform audits
SUPERVISOR     — supervise auditors
```

## Known Issues (22 TS Errors)

### audits.controller.ts (15 errors)
Wrong field names — code was written against a conceptual clean schema:

| Line | Writes | Should Be |
|---|---|---|
| 48, 101 | `auditor.role` | No `role` on `aspnet_Users`; check via `aspnet_UsersInRoles` → `aspnet_Roles` |
| 73, 80, 106 | `auditor.id` | `auditor.UserId` |
| 74, 78, 106 | `auditor.email` | `auditor.Email` |
| 75, 77, 106 | `auditor.full_name` | `auditor.Name` |
| 80 | `plant.id` | `plant.idPlant` |
| 17, 30, 161 | `deriveAuditStatus` gets `Date \| null` | Function expects `string \| Date` (needs null guard or type fix) |

### audits.service.ts (1 error)
Line 136: `createMany` payload for `audit_details` missing required fields: `answerOk`, `answerNok`, `answerNc`, `answerNa` (all Boolean).

## Commands

```bash
# Backend
cd api
npm install
npx prisma generate        # Generate Prisma Client
npm run dev                # tsx watch src/server.ts
npm run build              # tsc -p tsconfig.json
npm run seed               # tsx src/db/seed_simple.ts

# Verify compilation
npx tsc --noEmit

# Frontend
cd frontend
npm install
npm run dev                # Vite dev server
```

## Coding Conventions
- No JSDoc comments. Minimal inline comments.
- Error handling: custom `AppError` class with `statusCode` + `message`, or `NotFoundError`/`DomainError` from `domain-error.ts`
- Auth middleware: `requireAuth` + `requireRole([...])` on routes
- Prisma client: imported as singleton from `../../db/prisma`
- Seed scripts in `api/src/db/`, NOT in `api/prisma/`
- `package.json` has duplicate `@prisma/client` and `prisma` entries (merge artifact from npm install)

## Important Paths

| Purpose | Path |
|---|---|
| Prisma schema | `api/prisma/schema.prisma` |
| Main seed script | `api/src/db/seed_simple.ts` |
| Comprehensive seed | `api/src/db/seed_new.ts` |
| Prisma client singleton | `api/src/db/prisma.ts` |
| Auth services | `api/src/modules/auth/auth.service.ts` |
| User admin services | `api/src/modules/users/user.service.ts` |
| Audit services | `api/src/modules/audits/audits.service.ts` |
| Plant services | `api/src/modules/plants/plant.service.ts` |
| Frontend API client | `frontend/src/services/api.service.ts` |
| Environment config | `api/.env` |
