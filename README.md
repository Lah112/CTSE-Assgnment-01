# DriveCore — Automobile Service & Repair Management Platform

DriveCore is a cloud-ready microservices platform for managing automobile service operations: user authentication, bookings, inventory, and billing, with a React frontend dashboard and AWS-focused CI/CD pipelines.

---

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [Services and Responsibilities](#services-and-responsibilities)
- [API Summary](#api-summary)
- [Frontend Features](#frontend-features)
- [Technology Stack](#technology-stack)
- [DevOps and Cloud (AWS Focus)](#devops-and-cloud-aws-focus)
- [CI/CD Workflows](#cicd-workflows)
- [Docker and Containerization](#docker-and-containerization)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Run Services Locally](#run-services-locally)
- [Build and Quality Commands](#build-and-quality-commands)
- [Security Implementation](#security-implementation)
- [OpenAPI Specs](#openapi-specs)

---

## Architecture Overview

DriveCore follows a distributed microservices architecture:

- **User Service** (Auth + user management) → `:3001`
- **Booking Service** (appointments) → `:3002`
- **Inventory Service** (spare parts stock) → `:3003`
- **Billing Service** (invoices and payment status) → `:3004`
- **Frontend (React + Vite)** consumes all backend services

### Inter-service communication

The User Service is the identity source. Other backend services synchronously verify users through:

`GET /api/auth/users/:userId`

Used by:
- Booking Service (before create/read booking flow)
- Inventory Service (before adding item)
- Billing Service (before creating invoice)

---

## Repository Structure

```text
CTSE-Assgnment-01/
├── README.md
├── .github/workflows/
│   ├── ci.yml                  # Auth/User service CI/CD
│   ├── booking-ci.yml
│   ├── inventory-ci.yml
│   ├── billing-ci.yml
│   └── frontend-ci.yml
├── drivecore-user-service/
├── drivecore-booking-service/
├── drivecore-inventory-service/
├── drivecore-billing-service/
└── drivecore-frontend/
```

---

## Services and Responsibilities

### 1) DriveCore User Service (`drivecore-user-service`)
- Port: **3001**
- Purpose:
  - User registration and login
  - JWT issuance (HS256)
  - User lookup endpoint for inter-service verification
- DB behavior:
  - Uses PostgreSQL
  - Initializes users table on startup

### 2) DriveCore Booking Service (`drivecore-booking-service`)
- Port: **3002**
- Purpose:
  - Create and list service bookings
  - Validates future date and service types
  - Verifies user through Auth Service
- DB behavior:
  - Creates `bookings` table + `user_id` index on startup

Supported service types:
`OIL_CHANGE, TIRE_ROTATION, BRAKE_SERVICE, GENERAL_INSPECTION, ENGINE_REPAIR, TRANSMISSION_SERVICE, AC_SERVICE, WHEEL_ALIGNMENT`

### 3) DriveCore Inventory Service (`drivecore-inventory-service`)
- Port: **3003**
- Purpose:
  - Add inventory items
  - List all inventory records
  - Verify user through Auth Service before insert
- DB behavior:
  - Creates `inventory` table on startup

### 4) DriveCore Billing Service (`drivecore-billing-service`)
- Port: **3004**
- Purpose:
  - Create invoices
  - Retrieve invoices by user
  - Verify user through Auth Service before insert
- DB behavior:
  - Creates `billing` table on startup

Invoice statuses:
`pending, paid, overdue, cancelled`

---

## API Summary

### User Service
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/users/:userId` (internal verification endpoint)
- `GET /health`

### Booking Service
- `POST /api/bookings`
- `GET /api/bookings/:userId`
- `GET /health`

### Inventory Service
- `GET /api/inventory`
- `POST /api/inventory`
- `GET /health`

### Billing Service
- `POST /api/billing`
- `GET /api/billing/:userId`
- `GET /health`

---

## Frontend Features

Frontend app (`drivecore-frontend`) includes:

- Public pages: landing, login, register
- Protected dashboard routes:
  - `/dashboard` (home summary)
  - `/dashboard/bookings`
  - `/dashboard/inventory`
  - `/dashboard/billing`
- Auth state via Context API + localStorage
- Axios clients per microservice with automatic Authorization header injection
- Auto logout redirect on API `401`

---

## Technology Stack

### Backend
- Node.js 20
- Express.js
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Request validation (`express-validator`)
- Inter-service HTTP (`axios`)

### Frontend
- React 18 + Vite
- React Router
- Axios
- TailwindCSS
- ESLint

### DevOps/Platform
- Docker (multi-stage builds)
- GitHub Actions
- AWS ECR + AWS ECS
- Snyk security scanning
- Nginx (frontend runtime image)

---

## DevOps and Cloud (AWS Focus)

The repository is configured for **AWS ECS-based deployments** through GitHub Actions.

### AWS deployment pattern (per service)
1. Snyk dependency/security scan
2. Docker build with commit SHA + `latest` tags
3. Push image to **Amazon ECR**
4. Pull current ECS task definition
5. Replace container image
6. Deploy updated task definition to **Amazon ECS**

### AWS region and cluster
- Region: `eu-north-1`
- ECS Cluster: `driveCore-Cluster`

### ECR repositories
- `auth-service`
- `booking-service`
- `inventory-service`
- `billing-service`
- `frontend-service`

### ECS services / task families
- Auth: `td-auth-service-gvf4n1fl` / `td-auth`
- Booking: `td-booking-service-vnyzo72d` / `td-booking`
- Inventory: `td-inventory-service-4lkmy7w5` / `td-inventory`
- Billing: `td-billing-service-t8kbv7gy` / `td-billing`
- Frontend: `td-frontend-service-3cda51lk` / `td-frontend`

### GitHub Secrets required
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SNYK_TOKEN`

---

## CI/CD Workflows

Location: `.github/workflows/`

- `ci.yml` → Auth/User service pipeline
- `booking-ci.yml` → Booking service pipeline
- `inventory-ci.yml` → Inventory service pipeline
- `billing-ci.yml` → Billing service pipeline
- `frontend-ci.yml` → Frontend pipeline (path-filtered to `drivecore-frontend/**`)

Common jobs:
- `security-scan` (Snyk)
- `build-and-push` (Docker + ECR)
- `deploy` (ECS task definition update + deploy)

---

## Docker and Containerization

### Backend services
- Multi-stage Dockerfiles
- Base image: `node:20-alpine`
- Runtime hardening:
  - Non-root user
  - `dumb-init` as PID 1 for proper signal handling
  - Production-only dependencies (`npm ci --omit=dev`)

### Frontend
- Build stage: Node + Vite
- Runtime stage: `nginx:alpine`
- SPA fallback configured in `drivecore-frontend/nginx/default.conf`
- Build-time env injection via `VITE_*` build args

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL (or managed Postgres URI)

### Install dependencies

```bash
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01

cd drivecore-user-service && npm ci
cd ../drivecore-booking-service && npm ci
cd ../drivecore-inventory-service && npm ci
cd ../drivecore-billing-service && npm ci
cd ../drivecore-frontend && npm ci
```

---

## Environment Variables

### User Service (`drivecore-user-service`)
Required:
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Database config (choose one approach):
- `DATABASE_URL`
**or**
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

Optional:
- `PORT` (default `3001`)
- `CORS_ORIGIN`
- `BCRYPT_SALT_ROUNDS`
- `NODE_ENV`

### Booking Service (`drivecore-booking-service`)
Required:
- `DATABASE_URL`
- `AUTH_SERVICE_URL`

Optional:
- `PORT` (default `3002`)
- `CORS_ORIGIN` (default `http://localhost:3000`)
- `NODE_ENV`

### Inventory Service (`drivecore-inventory-service`)
Required:
- `DATABASE_URL`
- `AUTH_SERVICE_URL` (required for `POST /api/inventory`)

Optional:
- `PORT` (default `3003`)
- `CORS_ORIGIN` (default `http://localhost:3000`)

### Billing Service (`drivecore-billing-service`)
Required:
- `DATABASE_URL`
- `AUTH_SERVICE_URL` (required for `POST /api/billing`)

Optional:
- `PORT` (default `3004`)
- `CORS_ORIGIN` (default `http://localhost:3000`)
- `NODE_ENV`

### Frontend (`drivecore-frontend`)
Set in `.env` for local Vite runtime:
- `VITE_AUTH_SERVICE_URL`
- `VITE_BOOKING_SERVICE_URL`
- `VITE_INVENTORY_SERVICE_URL`
- `VITE_BILLING_SERVICE_URL`

Example local values:

```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_BOOKING_SERVICE_URL=http://localhost:3002
VITE_INVENTORY_SERVICE_URL=http://localhost:3003
VITE_BILLING_SERVICE_URL=http://localhost:3004
```

---

## Run Services Locally

Open separate terminals:

```bash
# user service
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-user-service
npm run dev

# booking service
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-booking-service
npm run dev

# inventory service
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-inventory-service
npm run dev

# billing service
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-billing-service
npm run dev

# frontend
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-frontend
npm run dev
```

Frontend default dev URL: `http://localhost:5173`

---

## Build and Quality Commands

```bash
# frontend lint (currently reports existing prop-types issues)
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-frontend
npm run lint

# frontend production build
npm run build

# backend placeholder tests
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-user-service && npm test
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-booking-service && npm test
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-inventory-service && npm test
cd /home/runner/work/CTSE-Assgnment-01/CTSE-Assgnment-01/drivecore-billing-service && npm test
```

---

## Security Implementation

Implemented security controls across services:

- `helmet` secure headers
- CORS restrictions per service
- Request body limits (`10kb`)
- Input validation with `express-validator`
- Parameterized SQL queries (`pg` placeholders)
- Password hashing with bcrypt
- JWT-based authentication
- Graceful shutdown handlers (backend services)
- Snyk scanning in CI pipelines
- Non-root container users and minimized runtime images

---

## OpenAPI Specs

Available Swagger/OpenAPI files:

- `/drivecore-booking-service/swagger.yaml`
- `/drivecore-inventory-service/swagger.yaml`
- `/drivecore-billing-service/swagger.yaml`

These include request/response schemas, status codes, and inter-service behavior notes.

---

If you want, I can also generate a **diagram-focused version** of this README (service graph + AWS deployment flow + CI/CD sequence) and include Mermaid architecture diagrams.
