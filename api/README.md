# Industrial Audit & Monitoring System — API

Base URL: `http://localhost:4000`

---

## Authentication

### Register

```
POST /auth/register
```

```json
{
  "username": "admin1",
  "email": "admin1@example.com",
  "password": "password123",
  "fullName": "Admin One",
  "role": "Administrator",
  "division": "FMS"
}
```

### Login

```
POST /auth/login
```

```json
{
  "email": "admin1@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-here",
    "fullName": "Admin One",
    "role": "Administrator"
  }
}
```

> All protected endpoints require the `Authorization: Bearer <token>` header.

---

## Postman Setup

1. Create a new collection
2. Add a variable `baseUrl` = `http://localhost:4000`
3. Under **Authorization**, select **Bearer Token** and set the token value to the JWT from login
4. Optionally add a **Tests** script on the Login request to auto-set the token:

```js
const jsonData = pm.response.json();
pm.collectionVariables.set("token", jsonData.token);
```

Then use `{{token}}` in the Authorization header for all other requests.

---

## Health

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/health` | None |

```
GET {{baseUrl}}/health
```

---

## Users (Administrator only)

All endpoints require `Authorization: Bearer <token>` with Administrator role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users?status=Active` | List all users (optional `status` filter) |
| PATCH | `/admin/users/:id/approve` | Approve a pending user |
| PATCH | `/admin/users/:id/reject` | Reject a pending user |
| PATCH | `/admin/users/:id/block` | Block an active user |
| PATCH | `/admin/users/:id/unblock` | Unblock a blocked user |
| DELETE | `/admin/users/:id` | Delete a user |

### List users

```
GET {{baseUrl}}/admin/users
```

Optional query: `?status=Pending` | `Active` | `Blocked` | `Rejected`

### Approve user

```
PATCH {{baseUrl}}/admin/users/{{userId}}/approve
```

### Reject user

```
PATCH {{baseUrl}}/admin/users/{{userId}}/reject
```

### Block user

```
PATCH {{baseUrl}}/admin/users/{{userId}}/block
```

### Unblock user

```
PATCH {{baseUrl}}/admin/users/{{userId}}/unblock
```

### Delete user

```
DELETE {{baseUrl}}/admin/users/{{userId}}
```

---

## Plants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/plants` | Admin, Auditor | List all plants |
| GET | `/plants/:id` | Admin, Auditor | Get plant details |
| POST | `/plants` | Admin only | Create a plant |
| PATCH | `/plants/:id` | Admin only | Update a plant |
| DELETE | `/plants/:id` | Admin only | Delete a plant |
| GET | `/plants/:id/audits` | Admin, Auditor | List audits for a plant |
| GET | `/plants/:id/users` | Admin, Auditor | List users assigned to a plant |
| GET | `/plants/:id/schedules` | Admin, Auditor | List schedules for a plant |
| GET | `/plants/:id/dashboard` | Admin, Auditor | Plant dashboard summary |

### List all plants

```
GET {{baseUrl}}/plants
```

### Get plant by id

```
GET {{baseUrl}}/plants/1
```

### Create plant (Administrator)

```
POST {{baseUrl}}/plants
Content-Type: application/json
```

```json
{
  "designation": "FMS1",
  "family": "FMS"
}
```

**Validation rules:**
- `designation` — required, must be unique
- `family` — required, must be `"FMS"` or `"A&D"`

**Error responses:**

```json
{ "error": "Designation cannot be empty" }
{ "error": "Family must be FMS or A&D" }
{ "error": "Designation must be unique" }
```

### Update plant (Administrator)

```
PATCH {{baseUrl}}/plants/1
Content-Type: application/json
```

```json
{
  "designation": "FMS1-Updated",
  "family": "FMS"
}
```

All fields are optional on update.

### Delete plant (Administrator)

```
DELETE {{baseUrl}}/plants/1
```

### Get plant audits

```
GET {{baseUrl}}/plants/1/audits
```

### Get plant users

```
GET {{baseUrl}}/plants/1/users
```

### Get plant schedules

```
GET {{baseUrl}}/plants/1/schedules
```

### Get plant dashboard

```
GET {{baseUrl}}/plants/1/dashboard
```

**Response:**

```json
{
  "dashboard": {
    "plant": { "id": 1, "family": "FMS", "designation": "FMS1" },
    "auditsCount": 12,
    "usersCount": 5,
    "schedulesCount": 3,
    "latestAudits": []
  }
}
```

---

## Error Handling

All business errors return:

```json
{
  "error": "Human-readable error message"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g. invalid status transition) |
| 500 | Internal server error |
