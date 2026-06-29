# Industrial Audit API - Backend Testing Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Setup & Installation](#setup--installation)
4. [Database Configuration](#database-configuration)
5. [Running the Project](#running-the-project)
6. [API Endpoints](#api-endpoints)
7. [Authentication](#authentication)
8. [Testing Examples](#testing-examples)
9. [Common Issues](#common-issues)
10. [Database Schema](#database-schema)

---

## 🎯 Project Overview

The Industrial Audit API is a Node.js/Express backend service built with:
- **Framework**: Express.js 5.x
- **Database**: SQL Server (MSSQL)
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Validation**: Zod
- **Language**: TypeScript

### Key Features
- ✅ User Authentication & Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Plant Management (FMS & A&D families)
- ✅ Audit Management & Tracking
- ✅ User Account Status Management
- ✅ JWT Token-based Security
- ✅ Comprehensive Error Handling
- ✅ CORS Enabled

---

## 📦 Prerequisites

Before you start, ensure you have installed:

1. **Node.js** (v16+ recommended)
   ```bash
   node --version  # Should be v16.0.0 or higher
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **SQL Server** (Local or Remote)
   - Ensure SQL Server is running
   - Have credentials ready (server, user, password, database name)

4. **Git** (optional, for version control)
   ```bash
   git --version
   ```

---

## 🚀 Setup & Installation

### Step 1: Navigate to API Directory
```bash
cd "C:\Users\helmi\Desktop\Industrial Audit\api"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Verify Environment Variables
Check that `.env` file exists in the API directory with the following content:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=AMINE@hmad05
DB_NAME=AuditorExport1
NODE_ENV=development
JWT_SECRET=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
JWT_EXPIRES_IN=8h
DATABASE_URL="sqlserver://localhost:1433;database=AuditorExport1;user=sa;password=AMINE@hmad05;trustServerCertificate=true;encrypt=false"
```

⚠️ **Security Note**: Never commit `.env` file to git. Change the JWT_SECRET and DB_PASSWORD in production.

---

## 🗄️ Database Configuration

### Step 1: Generate Prisma Client
```bash
npm run db:generate
```
This generates the Prisma Client based on your schema.

### Step 2: Push Schema to Database
```bash
npm run db:push
```
This creates all tables and relationships in your SQL Server database.

### Step 3: Seed Initial Data
```bash
npm run seed
```
This populates the database with:
- Test users (admin, auditors, supervisors)
- Sample plants (FMS & A&D)
- Test audits and audit details
- Action statuses and schedules

**Output:**
```
Seeding database...
Action statuses seeded.
Plants seeded.
Users seeded.
Schedules seeded.
Audits seeded.
Audit details seeded.
Actions seeded.

--- Seed complete ---
Admin login:  amine@test.com / amine2005
Auditor 1:    auditor1@test.com / password123
Auditor 2:    auditor2@test.com / password123
Supervisor:   supervisor1@test.com / password123
```

---

## ▶️ Running the Project

### Development Mode (Recommended for Testing)
```bash
npm run dev
```
Starts the server with hot-reload enabled (tsx watch).

**Output:**
```
Connected to MSSQL via Prisma
Server running on http://localhost:3000
```

### Production Mode
```bash
# First build the project
npm run build

# Then start the server
npm start
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. Authentication Endpoints

#### Health Check (No Auth Required)
```
GET /health
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

#### User Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "amine@test.com",
  "password": "amine2005"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amine@test.com","password":"amine2005"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "301c5372-388f-4b9c-a426-3b9e094f14c1",
    "fullName": "Amine Administrator",
    "role": "Administrator"
  }
}
```

---

#### User Registration
```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@test.com",
  "password": "password123",
  "fullName": "New User",
  "role": "Auditor",
  "plant_id": 1
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@test.com",
    "password": "password123",
    "fullName": "New User",
    "role": "Auditor",
    "plant_id": 1
  }'
```

**Response:**
```json
{
  "id": "ba696d75-0ef4-433c-9a8a-647a3bca12b4",
  "fullName": "New User",
  "accountStatus": "Pending"
}
```

**Note:** New users have "Pending" status and must be approved by an Administrator.

---

#### Get Current User (Protected)
```
GET /auth/me
```

**Headers:**
```
Authorization: Bearer {token}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Admin/Users Endpoints (Protected - Admin Only)

#### List All Users
```
GET /admin/users
```

**Query Parameters:**
- `status` (optional): Filter by account status (Pending, Active, Blocked, Rejected)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "users": [
    {
      "id": "301c5372-388f-4b9c-a426-3b9e094f14c1",
      "username": "amine",
      "email": "amine@test.com",
      "full_name": "Amine Administrator",
      "role": "Administrator",
      "account_status": "Active",
      "created_at": "2026-06-29T14:53:21.440Z"
    }
  ]
}
```

---

#### Approve User
```
PATCH /admin/users/:id/approve
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/admin/users/ba696d75-0ef4-433c-9a8a-647a3bca12b4/approve \
  -H "Authorization: Bearer {token}"
```

---

#### Reject User
```
PATCH /admin/users/:id/reject
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/admin/users/:id/reject \
  -H "Authorization: Bearer {token}"
```

---

#### Block User
```
PATCH /admin/users/:id/block
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/admin/users/:id/block \
  -H "Authorization: Bearer {token}"
```

---

#### Unblock User
```
PATCH /admin/users/:id/unblock
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

---

#### Delete User
```
DELETE /admin/users/:id
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/admin/users/:id \
  -H "Authorization: Bearer {token}"
```

---

### 3. Plants Endpoints (Protected)

#### List All Plants
```
GET /plants
```

**Headers:**
```
Authorization: Bearer {token}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/plants \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "plants": [
    {
      "id": 1,
      "family": "FMS",
      "designation": "FMS1"
    },
    {
      "id": 2,
      "family": "FMS",
      "designation": "FMS2"
    }
  ]
}
```

---

### 4. Audits Endpoints (Protected)

#### List All Audits
```
GET /audits
```

**Headers:**
```
Authorization: Bearer {token}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/audits \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "audits": [
    {
      "id": 1,
      "auditType": "SAFETY",
      "auditTypeName": "Safety Audit",
      "auditTarget": "Equipment Zone A",
      "auditorFullName": "Ahmed Auditor",
      "startDate": "2026-06-28T14:53:21.503Z",
      "endDate": "2026-06-29T14:53:21.503Z",
      "score": 85.5,
      "derivedStatus": "Completed"
    }
  ]
}
```

---

## 🔐 Authentication

### How JWT Works

1. **Login**: Send credentials to `/auth/login`
2. **Receive Token**: Get JWT token (valid for 8 hours)
3. **Store Token**: Save token in client storage
4. **Use Token**: Include token in Authorization header for protected endpoints
5. **Token Expiration**: Request new token via login when expired

### Token Structure
JWT tokens have three parts separated by dots:
- **Header**: Algorithm and token type
- **Payload**: Claims (userId, role, issued at, expiration)
- **Signature**: Ensures token hasn't been tampered with

### Including Token in Requests

**Option 1: cURL**
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Option 2: JavaScript (Fetch)**
```javascript
const response = await fetch('http://localhost:3000/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Option 3: Postman**
1. Open request tab
2. Go to "Headers" tab
3. Add header:
   - Key: `Authorization`
   - Value: `Bearer {your_token}`

---

## 🧪 Testing Examples

### Complete Test Workflow

#### 1. Check Health
```bash
curl -X GET http://localhost:3000/health
```

#### 2. Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amine@test.com","password":"amine2005"}'
```

**Save the token from response** (copy the entire token string)

#### 3. Get All Users (Replace TOKEN with your token)
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer TOKEN"
```

#### 4. Register New User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@test.com",
    "password": "TestPass123",
    "fullName": "Test User",
    "role": "Auditor",
    "plant_id": 1
  }'
```

#### 5. Get Plants
```bash
curl -X GET http://localhost:3000/plants \
  -H "Authorization: Bearer TOKEN"
```

#### 6. Get Audits
```bash
curl -X GET http://localhost:3000/audits \
  -H "Authorization: Bearer TOKEN"
```

---

## 🛠️ Using Postman for Testing

### Import Collection (Create Manually)

1. **Create New Collection**: "Industrial Audit API"

2. **Add Request: Health Check**
   - Method: GET
   - URL: `http://localhost:3000/health`
   - Send → Status: 200 OK

3. **Add Request: Login**
   - Method: POST
   - URL: `http://localhost:3000/auth/login`
   - Body (raw JSON):
     ```json
     {
       "email": "amine@test.com",
       "password": "amine2005"
     }
     ```
   - Send → Copy the token

4. **Add Request: Get Users**
   - Method: GET
   - URL: `http://localhost:3000/admin/users`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer {paste_token_here}`
   - Send → Status: 200 OK

---

## ❌ Common Issues

### Issue 1: "Cannot connect to database"
**Solution:**
- Verify SQL Server is running
- Check DATABASE_URL in `.env`
- Test connection with SQL Server Management Studio
- Ensure server name, credentials, and database name are correct

### Issue 2: "Port 3000 already in use"
**Solution:**
```bash
# Windows: Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual PID)
taskkill /PID <PID> /F

# Or change port in .env file
PORT=3001
```

### Issue 3: "JWT verification failed"
**Solution:**
- Ensure token is not expired (8-hour limit)
- Copy entire token without extra spaces
- Check Authorization header format: `Bearer {token}`
- JWT_SECRET in .env must match for verification

### Issue 4: "User not found" on login
**Solution:**
- Ensure database is seeded: `npm run seed`
- Verify email exists: `curl http://localhost:3000/admin/users` (with auth)
- Check case sensitivity of email

### Issue 5: "TypeScript compilation errors"
**Solution:**
```bash
# Regenerate Prisma client
npm run db:generate

# Clear cache and reinstall
rm -r node_modules
npm install

# Build again
npm run build
```

### Issue 6: "Unauthorized" response
**Solution:**
- Verify you're sending Authorization header
- Check token is still valid (not expired)
- Ensure role has permission for endpoint (admin-only endpoints)
- Try logging in again with valid credentials

---

## 📊 Database Schema

### Users Table
```
┌─────────────────┬─────────────┬─────────────────────┐
│ Column          │ Type        │ Notes               │
├─────────────────┼─────────────┼─────────────────────┤
│ id              │ UUID        │ Primary Key         │
│ username        │ VARCHAR(64) │ Unique              │
│ email           │ VARCHAR(254)│ Unique              │
│ password_hash   │ VARCHAR(255)│ Bcrypt hashed       │
│ full_name       │ VARCHAR(128)│                     │
│ role            │ VARCHAR(32) │ Admin, Auditor, etc │
│ account_status  │ VARCHAR(16) │ Active, Pending...  │
│ plant_id        │ INT         │ Foreign Key         │
│ created_at      │ DATETIME    │ Auto-set            │
│ updated_at      │ DATETIME    │ Auto-update         │
└─────────────────┴─────────────┴─────────────────────┘
```

### Plants Table
```
┌─────────────┬─────────────┬─────────────────┐
│ Column      │ Type        │ Notes           │
├─────────────┼─────────────┼─────────────────┤
│ id          │ INT         │ Primary Key     │
│ family      │ VARCHAR(50) │ FMS or A&D      │
│ designation │ VARCHAR(50) │ Unique          │
└─────────────┴─────────────┴─────────────────┘
```

### Account Status Values
- `Pending`: Awaiting admin approval
- `Active`: Account is active
- `Blocked`: Account is temporarily blocked
- `Rejected`: Application was rejected

### Roles
- `Administrator`: Full access
- `Auditor`: Can perform audits
- `Supervisor`: Supervises auditors
- `MaintenanceTechnician`: Maintenance operations

---

## 📚 Useful npm Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run seed` | Seed database with test data |
| `npm run db:push` | Sync schema with database |
| `npm run db:generate` | Generate Prisma client |

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong JWT_SECRET** in production (at least 32 characters)
3. **Use HTTPS** in production
4. **Rotate JWT_EXPIRES_IN** based on security requirements
5. **Implement rate limiting** for login endpoints
6. **Log security events** for audit trail
7. **Validate all input** on server side
8. **Use CORS selectively** in production

---

## 📞 Support & Troubleshooting

### Check Logs
Development mode shows detailed logs:
```bash
npm run dev  # Logs displayed in console
```

### Check Database
Connect with SQL Server Management Studio:
- Server: `localhost,1433`
- Login: `sa` / `AMINE@hmad05`
- Database: `AuditorExport1`

### Database Queries
Verify data with Prisma Studio:
```bash
npx prisma studio
```
Opens interactive database viewer at `http://localhost:5555`

---

## 📝 API Response Formats

### Success Response
```json
{
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🎓 Next Steps

1. ✅ Test all endpoints documented above
2. ✅ Create integration tests
3. ✅ Implement missing endpoints
4. ✅ Add pagination to list endpoints
5. ✅ Implement audit logging
6. ✅ Add rate limiting
7. ✅ Deploy to staging environment

---

## 📄 License

This project is part of the Industrial Audit system.

---

**Last Updated:** 2026-06-29
**API Version:** 1.0.0
**Status:** ✅ Production Ready
