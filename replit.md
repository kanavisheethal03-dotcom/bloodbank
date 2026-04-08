# Blood Bank Management System

## Overview

A full-stack Blood Bank Management System with React frontend and Express/PostgreSQL backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/blood-bank)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Charts**: Recharts (BarChart for blood availability)

## Features

### Public Pages
- **Home** (`/`) — Dashboard summary with stats (total donors, requests, blood units available)
- **Donor Registration** (`/register`) — Form with validation (Name, Age, Blood Group, Phone, Email, Weight, Disease, Last Donation Date, City)
- **Blood Search** (`/search`) — Search donors by blood group and city; contact info hidden until donor consent
- **Blood Request** (`/request`) — Submit blood request (Patient Name, Blood Group, Units, Hospital, Contact, City)
- **Blood Availability** (`/availability`) — Bar chart + table showing units by blood group

### Admin Pages
- **Admin Login** (`/admin/login`) — Credentials: admin / admin123
- **Admin Dashboard** (`/admin/dashboard`) — Manage donors (Accept/Reject/Defer), manage blood requests

## Database Tables

- **donors** — Donor registrations with status (Pending/Eligible/Rejected/Deferred) and consent_status
- **blood_requests** — Patient blood requests with request_status
- **blood_stock** — Blood inventory by blood group

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Admin Credentials

- Username: `admin`
- Password: `admin123`

## Privacy/Consent System

Donor contact details (phone/email) are only revealed to patients after the donor explicitly accepts consent. The blood search page shows donors without contact info by default.

## Sample Data

- 8 sample donors across different cities and blood groups
- 8 blood groups stocked (A+, A-, B+, B-, AB+, AB-, O+, O-)
- 3 sample blood requests

## Supabase Setup

To connect the application to Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Copy the `DATABASE_URL` from the Project Settings -> Database (use the connection string for the Transaction Pooler if possible).
3. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings -> API.
4. Create a `.env` file based on `.env.example` and fill in the values.
5. Run `pnpm --filter @workspace/db run push` to sync the schema.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
