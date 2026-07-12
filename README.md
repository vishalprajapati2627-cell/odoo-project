# AssetFlow Backend

A REST API built with **Node.js + Express + MongoDB (Mongoose)** for the AssetFlow
company asset management frontend. It replicates every data model and business
rule that currently lives in the frontend's `AppContext.jsx`, backed by a real
database and JWT authentication.

## Stack

- Node.js / Express
- MongoDB / Mongoose
- JWT auth (`jsonwebtoken`) + password hashing (`bcryptjs`)
- `helmet`, `cors`, `express-rate-limit`, `morgan`

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET as needed
```

Make sure MongoDB is running locally (`mongodb://127.0.0.1:27017`) or point
`MONGO_URI` at an Atlas cluster.

```bash
npm run seed   # optional: loads demo data matching the frontend's original seed data
npm run dev    # starts on http://localhost:5000 with nodemon
# or
npm start
```

Demo accounts created by `npm run seed`:

| Email                     | Password    | Role       |
|---------------------------|-------------|------------|
| admin@company.com         | admin1234   | Admin      |
| priya.shah@company.com    | password123 | Employee   |
| arjun.nair@company.com    | password123 | Employee   |
| aditi.rao@company.com     | password123 | Department Head |
| karan.verma@company.com   | password123 | Asset Manager |

## Project structure

```
backend/
├── server.js                  # entry point
├── src/
│   ├── app.js                 # express app, middleware, route mounting
│   ├── config/db.js           # mongoose connection
│   ├── models/                # Department, Category, User, Asset,
│   │                             AllocationHistory, Booking, Maintenance,
│   │                             Audit, Log, Counter
│   ├── middleware/             # auth (protect/authorize), errorHandler
│   ├── controllers/            # one per resource, business logic lives here
│   ├── routes/                 # one per resource
│   └── utils/                  # asyncHandler, ApiError, generateToken, addLog, seed.js
```

## Auth

All routes except `/api/auth/signup` and `/api/auth/login` require:

```
Authorization: Bearer <token>
```

Roles: `Employee`, `Asset Manager`, `Department Head`, `Admin`. New signups are
always created as `Employee` — role changes only happen via
`PUT /api/employees/:id/role`, restricted to `Admin`, matching the frontend's
"role assignment happens only in Org Setup" rule.

## Business rules implemented

- **Auto-generated asset tags** (`AF-0001`, `AF-0002`, ...) via an atomic counter, race-condition safe.
- **Double-allocation block**: `POST /api/assets/:tag/allocate` is rejected with `409` if the asset isn't `Available` — direct re-allocation is blocked, a transfer request must be used instead.
- **Transfer request/approve/reject flow** via `AllocationHistory`, with a `pending` flag and an approvals queue (`GET /api/allocation-history/pending`).
- **Booking overlap validation**: same resource + date + overlapping time range is rejected with `409`.
- **Maintenance kanban** (`Pending → Approved → Technician Assigned → In Progress → Resolved`) with side effects: reaching `Approved` flips the asset to `Maintenance` status, reaching `Resolved` flips it back to `Available`.
- **Audit closing side effects**: items still flagged `Missing`/`Damaged` when an audit is closed push the asset to `Lost`/`Maintenance` respectively.
- **Activity log** entries are written automatically by nearly every mutating action, filterable by category (`Alerts`/`Approvals`/`Bookings`) for the Notifications page.
- **Live dashboard KPIs** and **report aggregates** (utilization by department, maintenance trend, most-used resources, idle assets, due-for-maintenance/nearing retirement) computed from real data instead of static demo numbers.

## API Reference

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account (always role `Employee`) |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Private | Current user |

### Departments
| Method | Route | Access |
|---|---|---|
| GET | `/api/departments` | Private |
| POST | `/api/departments` | Admin |
| PUT | `/api/departments/:id` | Admin |
| DELETE | `/api/departments/:id` | Admin |

### Categories
| Method | Route | Access |
|---|---|---|
| GET | `/api/categories` | Private |
| POST | `/api/categories` | Admin |
| DELETE | `/api/categories/:id` | Admin |

### Employees
| Method | Route | Access |
|---|---|---|
| GET | `/api/employees` | Private |
| POST | `/api/employees` | Admin |
| PUT | `/api/employees/:id` | Admin |
| PUT | `/api/employees/:id/role` | Admin |

### Assets
| Method | Route | Access |
|---|---|---|
| GET | `/api/assets?search=&status=` | Private |
| GET | `/api/assets/:tag` | Private |
| POST | `/api/assets` | Admin, Asset Manager |
| GET | `/api/assets/:tag/history` | Private |
| POST | `/api/assets/:tag/allocate` | Admin, Asset Manager |
| POST | `/api/assets/:tag/transfer` | Private |
| POST | `/api/assets/:tag/return` | Private |

### Allocation history / transfer approvals
| Method | Route | Access |
|---|---|---|
| GET | `/api/allocation-history/pending` | Admin, Asset Manager, Department Head |
| POST | `/api/allocation-history/:id/approve` | Admin, Asset Manager, Department Head |
| POST | `/api/allocation-history/:id/reject` | Admin, Asset Manager, Department Head |

### Bookings
| Method | Route | Access |
|---|---|---|
| GET | `/api/bookings?resource=&date=` | Private |
| POST | `/api/bookings` | Private |
| PATCH | `/api/bookings/:id/advance` | Admin, Asset Manager |
| DELETE | `/api/bookings/:id` | Owner, Admin, Asset Manager |

### Maintenance
| Method | Route | Access |
|---|---|---|
| GET | `/api/maintenance` | Private |
| POST | `/api/maintenance` | Private |
| PATCH | `/api/maintenance/:id/assign` | Admin, Asset Manager |
| PATCH | `/api/maintenance/:id/advance` | Admin, Asset Manager |

### Audits
| Method | Route | Access |
|---|---|---|
| GET | `/api/audits` | Private |
| POST | `/api/audits` | Admin |
| PATCH | `/api/audits/:id/items/:tag` | Admin, Asset Manager |
| POST | `/api/audits/:id/close` | Admin |

### Logs / Notifications
| Method | Route | Access |
|---|---|---|
| GET | `/api/logs?category=` | Private |

### Dashboard & Reports
| Method | Route | Access |
|---|---|---|
| GET | `/api/dashboard/kpis` | Private |
| GET | `/api/reports/utilization` | Private |
| GET | `/api/reports/maintenance-trend` | Private |
| GET | `/api/reports/most-used` | Private |
| GET | `/api/reports/idle-assets` | Private |
| GET | `/api/reports/due-maintenance` | Private |

## Wiring up the frontend

Point the frontend at `http://localhost:5000/api` and swap `AppContext.jsx`'s
in-memory `useState` calls for calls to these endpoints (e.g. with `fetch` or
`axios`), storing the returned JWT in memory/`localStorage` and sending it as
`Authorization: Bearer <token>` on every request. I kept response shapes close
to the existing seed data field names (`tag`, `status`, `holder`, `dept`, etc.)
to make that swap as mechanical as possible — the main difference is that
`holder`/`dept`/`raisedBy`/`bookedBy` etc. are now populated Mongo references
(`{ _id, name, ... }`) rather than plain strings.
