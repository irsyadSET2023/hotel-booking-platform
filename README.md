# Hotel Booking Platform

A full-stack hotel booking platform built with **Next.js 16** (frontend) and **Hono + Bun** (backend), featuring email-verified checkout, Stripe payment integration, room availability search, and a multi-step booking flow.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Testing](#testing)

---

## Architecture Overview

```
hotel-booking-plstform/
├── hbp-fe/   # Next.js 16 frontend (App Router)
└── hbp-be/   # Hono + Bun backend (REST API)
```

The frontend communicates with the backend exclusively through **Next.js Server Actions** — there are no direct client-to-backend API calls. All sensitive operations (auth tokens, Stripe keys, DB queries) remain on the server.

---

## Tech Stack

### Frontend (`hbp-fe`)

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Framework        | Next.js 16 (App Router)           |
| Language         | TypeScript                        |
| Styling          | Tailwind CSS v4                   |
| UI Components    | shadcn/ui (Radix UI primitives)   |
| State Management | Zustand with `persist` middleware |
| Forms            | react-hook-form + Zod             |
| Icons            | Lucide React                      |
| Package Manager  | Bun                               |

### Backend (`hbp-be`)

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Runtime          | Bun                                  |
| Framework        | Hono                                 |
| Language         | TypeScript                           |
| ORM              | Prisma 7 (with `@prisma/adapter-pg`) |
| Database         | PostgreSQL                           |
| Validation       | Zod + `@hono/zod-validator`          |
| Auth             | JWT (via `jsonwebtoken`)             |
| Email            | Nodemailer + Mailtrap                |
| Payments         | Stripe                               |
| Password Hashing | bcryptjs                             |

---

## Project Structure

### Frontend (`hbp-fe`)

```
app/
├── (provider)/
│   ├── cart-store.tsx              # Zustand cart store (localStorage)
│   └── customer-checkout-store.tsx # Zustand checkout store (email + billing)
├── (services)/
│   ├── customer-service.ts         # Server actions: email check, OTP, checkout
│   ├── reference-service.ts        # Server actions: countries, cities
│   └── list-rooms-service.ts       # Server action: room listing with filters
├── customer/
│   ├── page.tsx                    # Checkout page (wrapped in Suspense)
│   ├── (components)/
│   │   ├── checkout-stepper.tsx    # Root orchestrator — URL + Zustand persistence
│   │   ├── step-email.tsx          # Step 1: email verification / OTP
│   │   ├── step-billing.tsx        # Step 2: billing address form
│   │   ├── step-review.tsx         # Step 3: cart review + guest details + submit
│   │   ├── step-indicator.tsx      # Visual step progress bar
│   │   └── searchable-select.tsx   # Filterable select dropdown
│   └── payment/
│       ├── success/page.tsx        # Post-payment success page
│       └── cancel/page.tsx         # Post-payment cancel page
└── room/
    ├── page.tsx                    # Room listing page
    └── (components)/
        ├── room-card-list.tsx      # Self-fetching room list with filters
        ├── room-card.tsx           # Individual room card with Add to Cart
        └── cart.tsx                # Cart sheet (dialog)
components/
└── ui/
    ├── field.tsx                   # Field, FieldGroup, FieldLabel, FieldError
    ├── input-group.tsx             # InputGroup with addons
    └── ...                         # button, input, select, dialog, textarea, etc.
```

### Backend (`hbp-be`)

```
src/
├── controllers/
│   ├── auth/                       # Login, profile
│   ├── customer/                   # Email check, OTP, checkout
│   ├── hotel/                      # Hotel + hotel admin CRUD
│   ├── payment-gateway/            # Stripe webhook handler
│   ├── references/                 # Countries, cities, timezones
│   └── room/                       # Room categories listing
├── services/
│   ├── auth/                       # Login service
│   ├── customer/
│   │   ├── check-customer-email    # Lookup + return saved billing address
│   │   ├── checkout-cart           # Create order, bookings, Stripe session
│   │   ├── confirm-payment         # Mark order/bookings PAID on webhook
│   │   └── failed-customer-payment # Handle failed/expired Stripe sessions
│   ├── hotel/                      # Hotel CRUD services
│   ├── otp/                        # OTP send + verify
│   ├── references/                 # Country, city, timezone lookups
│   └── room/                       # Room availability queries
├── middlewares/
│   ├── authenticate.ts             # JWT verification
│   ├── authorize.ts                # Role-based access (SUPER_ADMIN, HOTEL_ADMIN)
│   └── validate-request.ts         # Zod request validation
├── external-services/
│   ├── email-service.ts            # Nodemailer wrapper
│   └── payment-gateways/stripe.ts  # Stripe checkout session creation
└── prisma/
    ├── schema.prisma
    ├── seed.ts                      # Production seed
    └── seeders/                     # Modular seeders (references, users, hotels, rooms)
```

---

## Features

### Room Discovery

- Paginated room category listing with real-time availability check
- Filter by: **check-in / check-out dates**, **room category** (Standard, Deluxe, Suite), **search term**
- All filters are URL-query-param driven — shareable and browser-back-compatible
- Client-side fetch with loading state and request cancellation

### Cart

- Add / remove rooms from cart
- Cart state persisted to **localStorage** via Zustand `persist`
- Badge counter on cart icon
- "Proceed to Checkout" deep-link

### 3-Step Checkout Flow

| Step                    | Feature                                                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Verify Email**    | Checks if email exists and is verified. If not verified, sends an OTP via email. Re-sends OTP on request. Skips step 2 if billing address already saved from a previous booking.         |
| **2 — Billing Details** | Full billing address form: name, address, country/city (searchable lazy-loaded dropdowns), postal code, phone country + number. Pre-filled with last known billing address if available. |
| **3 — Review & Pay**    | Displays each cart item with dates. Collects guest name, email, and optional special requests per room. Submits to backend, redirects to Stripe Checkout.                                |

**Persistence:** Current step is stored in the URL (`?step=N`). Email and billing data are stored in **localStorage** (separate `hbp-checkout` Zustand store). Refreshing the page never resets the flow. Direct URL access to a later step without prerequisites automatically redirects back.

### Payment (Stripe)

- Stripe Checkout session created at cart submission
- Browser is redirected to Stripe's hosted payment page
- **Success** (`/customer/payment/success`) and **Cancel** (`/customer/payment/cancel`) redirect pages
- Stripe webhook (`POST /webhook/stripe`) confirms payment and marks orders + bookings as `PAID`
- Failed/expired sessions handled via webhook

### Authentication & Authorization (Backend)

- JWT-based auth with configurable expiry
- Role-based access control: `SUPER_ADMIN`, `HOTEL_ADMIN`
- Password hashing with bcryptjs

### Hotel & Room Management (Backend)

- Full CRUD for hotels (SUPER_ADMIN only)
- Hotel admins: create, list, toggle active status per hotel
- Room categories with base pricing and inventory
- Room availability query: checks against existing bookings for requested dates

### Reference Data

- Countries (with ISO codes, phone codes, currency, flag)
- Cities (grouped by country)
- Timezones (grouped by country)
- All endpoints support pagination + search

### Email (OTP)

- OTP sent to unverified customer email addresses via Nodemailer
- Configurable via Mailtrap (dev) or any SMTP provider

### Tax

- Configurable SST (Sales & Service Tax) rate via `SST_RATE` env variable (default 8%)

---

## Database Schema

Key models:

| Model                       | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `User`                      | Platform admins (SUPER_ADMIN, HOTEL_ADMIN)          |
| `Customer`                  | Booking customers identified by email               |
| `Hotel`                     | Hotel properties                                    |
| `RoomCategory`              | Room types per hotel with base price                |
| `Room`                      | Individual room units                               |
| `RoomInventory`             | Per-day availability count per room category        |
| `Booking`                   | A single room booking within an order               |
| `Order`                     | Groups one or more bookings; tied to Stripe session |
| `Payment`                   | Payment record linked to an order                   |
| `BillingAddress`            | Customer billing details (primary flag)             |
| `Country / City / Timezone` | Reference data                                      |
| `CartItem / Cart`           | Transient cart state (server-side)                  |
| `Otp`                       | One-time passwords for email verification           |

---

## API Reference

### Auth

| Method | Path                   | Auth | Description        |
| ------ | ---------------------- | ---- | ------------------ |
| POST   | `/api/auth/login`      | —    | Login, returns JWT |
| GET    | `/api/auth/my-profile` | JWT  | Get own profile    |

### Hotels

| Method | Path                                  | Role                      | Description             |
| ------ | ------------------------------------- | ------------------------- | ----------------------- |
| POST   | `/api/hotels`                         | SUPER_ADMIN               | Create hotel            |
| GET    | `/api/hotels`                         | SUPER_ADMIN               | List hotels (paginated) |
| GET    | `/api/hotels/:uuid`                   | SUPER_ADMIN / HOTEL_ADMIN | Get hotel               |
| PATCH  | `/api/hotels/:uuid`                   | SUPER_ADMIN / HOTEL_ADMIN | Update hotel            |
| DELETE | `/api/hotels/:uuid`                   | SUPER_ADMIN               | Soft delete hotel       |
| POST   | `/api/hotels/:uuid/admins`            | SUPER_ADMIN               | Add hotel admin         |
| GET    | `/api/hotels/:uuid/admins`            | SUPER_ADMIN               | List hotel admins       |
| PATCH  | `/api/hotels/:uuid/admins/:adminUuid` | SUPER_ADMIN               | Toggle admin status     |

### Rooms

| Method | Path                    | Auth         | Description                            |
| ------ | ----------------------- | ------------ | -------------------------------------- |
| GET    | `/api/rooms`            | Optional JWT | List rooms                             |
| GET    | `/api/rooms/categories` | —            | List room categories with availability |

Query params for categories: `checkInDate`, `checkOutDate`, `page`, `limit`, `search`, `roomCategory`

### Customers

| Method | Path                           | Auth | Description                        |
| ------ | ------------------------------ | ---- | ---------------------------------- |
| POST   | `/api/customers/check-email`   | —    | Check email + return saved billing |
| POST   | `/api/customers/otp/send`      | —    | Send OTP to email                  |
| POST   | `/api/customers/otp/verify`    | —    | Verify OTP code                    |
| POST   | `/api/customers/checkout/cart` | —    | Create order + Stripe session      |

### References

| Method | Path                                   | Description                              |
| ------ | -------------------------------------- | ---------------------------------------- |
| GET    | `/api/references/countries`            | List countries (`?search=&page=&limit=`) |
| GET    | `/api/references/cities/:countryId`    | List cities for a country                |
| GET    | `/api/references/timezones/:countryId` | List timezones for a country             |

### Webhooks

| Method | Path              | Description                                 |
| ------ | ----------------- | ------------------------------------------- |
| POST   | `/webhook/stripe` | Stripe event handler (payment confirmation) |

### Health

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.x
- PostgreSQL (or a hosted instance)
- Stripe account
- Mailtrap (or any SMTP) account

### Backend

```bash
cd hbp-be

# Install dependencies
bun install

# Copy and fill environment variables
cp .env.example .env

# Run database migrations
bun prisma migrate deploy

# Seed reference + test data
bun seed

# Start development server
bun dev
```

The API will be available at `http://localhost:8080`.

### Frontend

```bash
cd hbp-fe

# Install dependencies
bun install

# Copy and fill environment variables
cp .env.example .env.local

# Start development server
bun dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`.env`)

```env
# Server
APP_PORT=8080
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_booking
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/hotel_booking_test

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Tax
SST_RATE=0.08

# Email (Mailtrap dev / any SMTP)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your-mailtrap-user
MAILTRAP_PASSWORD=your-mailtrap-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:3000/customer/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/customer/payment/cancel
```

### Frontend (`.env.local`)

```env
BACKEND_API_URL=http://localhost:8080
```

---

## Docker

Both services ship with multi-stage Dockerfiles for lean production images.

### Frontend

```bash
docker build \
  --build-arg NEXT_PUBLIC_BACKEND_API_URL=https://api.yourdomain.com \
  -t hbp-fe \
  ./hbp-fe
```

**Stages:** `deps` (bun install) → `builder` (bun run build) → `runner` (node, standalone output only)

### Backend

```bash
docker build -t hbp-be ./hbp-be
```

**Stages:** `deps` (bun install) → `builder` (prisma generate + bun build) → `runner` (bundle only)

### Run containers

```bash
# Backend
docker run -p 8080:8080 --env-file hbp-be/.env hbp-be

# Frontend
docker run -p 3000:3000 -e BACKEND_API_URL=http://hbp-be:8080 hbp-fe
```

---

## Testing

The backend includes end-to-end and concurrency tests using **Bun's built-in test runner**.

```bash
cd hbp-be
bun test
```

### Test Coverage

- **`checkout-and-confirm-payment.e2e.test.ts`** — Full checkout flow: cart creation → Stripe session → webhook confirmation → order/booking status assertions
- **`checkout-confirm-payment.concurrent.test.ts`** — Concurrent checkout attempts on the same inventory to validate race condition handling

Stripe and email services are mocked during tests.
