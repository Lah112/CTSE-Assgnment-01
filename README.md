DriveCore - Automobile Service & Repair Management System

Overview

DriveCore is a microservices-based automobile service and repair management system designed to streamline vehicle repair appointments, inventory management, billing, and user authentication. The system follows a distributed architecture with five independent microservices, each responsible for a specific business domain.

Architecture


┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│                         (Port 3000)                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                             │
│                    (Load Balancer / Reverse Proxy)              │
└─────────────────────────────────────────────────────────────────┘
        │           │           │           │
        ▼           ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│   User    │ │  Booking  │ │ Inventory │ │  Billing  │
│  Service  │ │  Service  │ │  Service  │ │  Service  │
│  :3001    │ │  :3002    │ │  :3003    │ │  :3004    │
└───────────┘ └───────────┘ └───────────┘ └───────────┘
    │               │               │               │
    └───────────────┴───────────────┴───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │  PostgreSQL   │
            │  Database     │
            │ (per service) │
            └───────────────┘

Microservices

1. DriveCore User Service (Port: 3001)

Central authentication and user management service.

Responsibilities:

    User registration and login

    JWT token issuance and validation

    User verification for other microservices

    Password hashing with bcrypt

API Endpoints:

    POST /api/auth/register - Create a new user account

    POST /api/auth/login - Authenticate and receive JWT

    GET /api/auth/users/:userId - Get user by ID (internal service-to-service)

    GET /health - Health check endpoint

2. DriveCore Booking Service (Port: 3002)

Manages service appointments and vehicle repair bookings.

Responsibilities:

    Service appointment creation

    Booking history management

    User verification via Auth Service

    Future date validation for appointments

API Endpoints:

    POST /api/bookings - Create a new service appointment

    GET /api/bookings/:userId - Get all bookings for a user

    GET /health - Health check endpoint

Service Types: OIL_CHANGE, TIRE_ROTATION, BRAKE_SERVICE, GENERAL_INSPECTION, ENGINE_REPAIR, TRANSMISSION_SERVICE, AC_SERVICE, WHEEL_ALIGNMENT
3. DriveCore Inventory Service (Port: 3003)

Manages spare parts and inventory tracking.

Responsibilities:

    Adding and managing spare parts

    Stock level tracking

    Inventory value calculation

    User verification via Auth Service

API Endpoints:

    GET /api/inventory - List all inventory items

    POST /api/inventory - Add a new inventory item

    GET /health - Health check endpoint

4. DriveCore Billing Service (Port: 3004)

Handles invoicing and payment tracking.

Responsibilities:

    Invoice creation and management

    Payment status tracking

    Revenue calculation

    User verification via Auth Service

API Endpoints:

    POST /api/billing - Create a new invoice

    GET /api/billing/:userId - Get all invoices for a user

    GET /health - Health check endpoint

Invoice Status: pending, paid, overdue, cancelled

Service Communication

All microservices communicate synchronously via REST over HTTP. The User Service acts as the authentication provider for all other services:

    Booking Service → User Service: Verifies user before creating or retrieving bookings

    Inventory Service → User Service: Verifies user before adding inventory items

    Billing Service → User Service: Verifies user before creating invoices

Technology Stack

Backend

    Runtime: Node.js 20

    Framework: Express.js

    Database: PostgreSQL

    Authentication: JWT (HS256) with bcrypt password hashing

    Validation: express-validator

    HTTP Client: Axios

Frontend

    Framework: React

    HTTP Client: Axios with JWT interceptors

    Authentication: Context API with localStorage

DevOps & Security

    CI/CD: GitHub Actions

    Containerization: Docker with multi-stage builds

    Container Registry: GitHub Container Registry (GHCR)

    Security Scanning: Snyk (SAST/SCA)

    Container Base: node:20-alpine

    Process Manager: dumb-init

Security Features

Application Security

    Helmet.js - Secure HTTP headers (CSP, HSTS, X-Frame-Options)

    CORS - Restricted origins with configurable CORS_ORIGIN

    Input Validation - express-validator for all endpoints

    Request Size Limiting - 10KB limit for JSON payloads

    Parameterized Queries - Protection against SQL injection

    Password Policy - Minimum 8 chars, uppercase, number, special character

    bcrypt Hashing - Configurable salt rounds

    Constant-time Comparison - Prevents timing-based user enumeration

Container Security

    Non-root User - appuser with minimal privileges

    Minimal Base Image - Alpine Linux for reduced attack surface

    Production-only Dependencies - No dev dependencies in final image

    Graceful Shutdown - SIGTERM/SIGINT handlers with 10-second timeout

DevSecOps

    SAST/SCA - Snyk vulnerability scanning in CI pipeline

    Dependency Scanning - Automatic CVE detection

    Fail Pipeline - High/critical severity vulnerabilities block deployment

    GitHub Code Scanning - SARIF report upload for user service

DevOps Pipeline

Continuous Integration (GitHub Actions)

Triggers: Push and pull request to main branch

Workflow Steps:

    Checkout - Repository clone

    Node.js Setup - Node 20 with npm caching

    Dependency Installation - npm ci for deterministic installs

    Linting - npm run lint (if present)

    Testing - npm test (if present)

    Building - npm run build (if present)

    Security Scan - Snyk vulnerability scanning

Matrix Build: All five services built in parallel for efficiency
