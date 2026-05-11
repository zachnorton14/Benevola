# Benevola

**Benevola** is a volunteer engagement platform built to connect individuals with organizations and ministries in need of help. Think LinkedIn for volunteerism — a social platform where people discover opportunities, build availability schedules, and organizations can manage and promote their events.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
- [API Reference](#api-reference)
  - [Events](#events--apievents)
  - [Users](#users--apiusers)
  - [Organizations](#organizations--apiorgs)
  - [Authentication](#authentication--apiauth)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Architecture Notes](#architecture-notes)

---

## Overview

Benevola bridges the gap between volunteers and the organizations that need them. Key platform capabilities include:

- **Dual account types** — separate registration and auth flows for individual volunteers and organizations
- **Event discovery** — search and filter volunteer opportunities by keyword, tag, date, time, and geographic radius
- **Schedule alignment** — volunteers set weekly availability; events can be filtered to match their schedule
- **Organization profiles** — orgs manage their own events, gallery images, and branding
- **User profiles** — volunteers track attendance, manage availability, and build a volunteer history
- **Image management** — direct browser-to-S3 uploads via presigned URLs for event cover photos and galleries
- **Full-text search** — Elasticsearch-powered search with fuzzy matching, autocomplete, and ranked results

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Material UI 7, Leaflet (maps) |
| Backend | Node.js 22, Express 5 |
| Database | PostgreSQL (via Sequelize ORM) |
| Search | Elasticsearch 9 |
| Auth | JWT + bcrypt |
| File Storage | AWS S3 (presigned URL uploads) |
| Validation | Zod |
| Deployment | AWS Lambda via Serverless Framework 4 |

---

## Project Structure

```
Benevola/
├── api/                        # Backend — Express API
│   ├── src/
│   │   ├── db/
│   │   │   ├── models/         # Sequelize models
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seeders/        # Seed data
│   │   ├── middleware/         # Auth, ownership verification
│   │   ├── routes/             # Route handlers (events, users, orgs, auth)
│   │   ├── schemas/            # Zod validation schemas
│   │   └── services/           # Business logic (S3, Elasticsearch)
│   ├── handler.js              # Lambda entry point
│   ├── serverless.yml          # Serverless Framework config
│   └── package.json
├── fe/                         # Frontend — React app
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   ├── pages/              # Route-level page components
│   │   └── App.js
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL
- Elasticsearch 9
- AWS account (S3 bucket + IAM credentials)
- Serverless Framework v4 (`npm i -g serverless`)

### Environment Variables

Create `api/.env` from `api/.env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/benevola
DB_SSL=false                        # true in production

# Auth
JWT_SECRET=<32-byte hex string>

# AWS
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=benevola-assets

# Elasticsearch
ELASTICSEARCH_NODE=https://...
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=...

# Server
NODE_ENV=development
BE_PORT=5173
ALLOWED_ORIGIN=http://localhost:3000
```

### Installation

```bash
# Backend
cd api && npm install

# Frontend
cd fe && npm install
```

### Database Setup

```bash
cd api
npm run db:migrate   # Run all pending migrations
npm run db:seed      # Seed initial data (tags, sample events, etc.)
```

---

## API Reference

All endpoints are prefixed with `/api`. Authenticated endpoints require a `Bearer <token>` header.

---

### Events — `/api/events`

#### Core CRUD

| Description | Method | Path | Auth |
|---|---|---|---|
| Get events (default feed) | `GET` | `/` | No |
| Get an event by ID | `GET` | `/:eventId` | No |
| Replace an event | `PUT` | `/:eventId` | Yes |
| Update an event's information | `PATCH` | `/:eventId` | Yes |
| Delete an event | `DELETE` | `/:eventId` | Yes |

#### Search & Filtering

`GET /search` — Full-text search with Elasticsearch. All parameters are optional and composable.

| Parameter | Description | Values / Notes |
|---|---|---|
| `tags` | Filter by tag(s), inclusive; best matches ranked first | `?tags=food&tags=youth` |
| `date` | Filter to a specific date | `?date=2026-06-15` |
| `beforeDate` | Only events on or before this date | `?beforeDate=2026-12-31` |
| `afterDate` | Only events on or after this date | `?afterDate=2026-01-01` |
| `beforeTime` | Only events at or before this time | `?beforeTime=18:00` |
| `afterTime` | Only events at or after this time | `?afterTime=09:00` |
| `nearLat` / `nearLng` / `radiusM` | Geographic radius filter | `?nearLat=35.78&nearLng=-78.64&radiusM=10000` |
| `userId` | Only events matching that user's availability | `?userId=42` |
| `alignsWithSchedule` | Filter to events that fit the user's saved schedule | `?alignsWithSchedule=true` |
| `sort` | Sort field | `date` (default) or `createdAt` |
| `order` | Sort direction | `asc` (default) or `desc` |
| `limit` | Max results to return | Integer, max `100`, default `20` |
| `offset` | Pagination offset | Integer, default `0` |

> **Date constraints:** `beforeDate` must be earlier than `afterDate`. Same rule applies for time filters.

#### Tags

| Description | Method | Path | Auth |
|---|---|---|---|
| Get all valid event tags | `GET` | `/tags` | No |
| Create a new event tag | `POST` | `/tags` | No |
| Delete an event tag | `DELETE` | `/tags` | No |

#### Attendees

| Description | Method | Path | Auth |
|---|---|---|---|
| Get all attendees of an event | `GET` | `/:eventId/attendees` | No |
| Add an attendee to an event | `POST` | `/:eventId/attendees/:userId` | Yes |
| Remove an attendee from an event | `DELETE` | `/:eventId/attendees/:userId` | Yes |

#### Images

| Description | Method | Path | Auth |
|---|---|---|---|
| Add image(s) to event gallery | `POST` | `/:eventId/gallery` | Yes |
| Remove image from event gallery | `DELETE` | `/:eventId/gallery` | Yes |
| Generate presigned upload URL(s) | `GET` | `/:eventId/image-upload-url` | Yes |

**Image upload URL parameters:**

| Parameter | Description | Values |
|---|---|---|
| `contentType` | File format | `image/jpeg` or `image/png` |
| `type` | Upload target | `cover` or `gallery` |
| `count` | Number of URLs to generate (gallery only) | Integer, max `10` |

---

### Users — `/api/users`

#### Core CRUD

| Description | Method | Path | Auth |
|---|---|---|---|
| Create a user | `POST` | `/` | No |
| Get a user | `GET` | `/:userId` | No |
| Replace a user | `PUT` | `/:userId` | Yes |
| Update a user's information | `PATCH` | `/:userId` | Yes |
| Delete a user | `DELETE` | `/:userId` | Yes |

#### Events

| Description | Method | Path | Auth |
|---|---|---|---|
| Get a specific user's events | `GET` | `/:userId/events` | No |
| Create an event (under a user) | `POST` | `/:userId/events` | — |

#### Availability

Availability is stored as a weekly schedule of time blocks per day (0 = Sunday, 6 = Saturday).

| Description | Method | Path | Auth |
|---|---|---|---|
| Get user's availability | `GET` | `/:userId/availability` | — |
| Create user availability schedule | `POST` | `/:userId/availability` | — |
| Replace whole availability schedule | `PUT` | `/:userId/availability` | — |
| Add time block for a specific day | `PUT` | `/:userId/availability/:slotId` | — |
| Delete a time block | `DELETE` | `/:userId/availability/:slotId` | — |

---

### Organizations — `/api/orgs`

| Description | Method | Path | Auth |
|---|---|---|---|
| Get all organizations | `GET` | `/` | No |
| Create an organization | `POST` | `/` | No |
| Get an organization | `GET` | `/:orgId` | No |
| Replace an organization | `PUT` | `/:orgId` | Yes |
| Update an organization's information | `PATCH` | `/:orgId` | Yes |
| Delete an organization | `DELETE` | `/:orgId` | Yes |
| Get events hosted by organization | `GET` | `/:orgId/events` | No |
| Create an event under this organization | `POST` | `/:orgId/events` | Yes |

---

### Authentication — `/api/auth`

| Description | Method | Path |
|---|---|---|
| Get the current user's info | `GET` | `/me` |
| Log out | `POST` | `/logout` |
| Register a user | `POST` | `/register/user` |
| Register an organization | `POST` | `/register/org` |
| Login as a user | `POST` | `/login/user` |
| Login as an organization | `POST` | `/login/org` |

**Token format:** Tokens are JWTs returned on login/register and must be sent as `Authorization: Bearer <token>`. Tokens expire after 24 hours.

---

## Deployment

The API is deployed as a single AWS Lambda function using the Serverless Framework.

```bash
cd api
npm run deploy       # serverless deploy
```

The frontend is a standard React build deployable to any static host (S3 + CloudFront, Vercel, Netlify, etc.).

```bash
cd fe
npm run build
```

---

## Roadmap

Features are grouped by theme. Items marked *designed* have been scoped and partially built but are not yet integrated into the platform.

### Discovery & Search

- **Organization search** — A dedicated page for searching and browsing organizations, with suggestions based on event history and past attendance.
- **User availability schedule** *(designed)* — Users specify a weekly availability schedule; events can be filtered to those that fall within a user's available times.
- **User & event skills** — Skills can be tagged on user profiles and events to better match volunteers to opportunities. Applicable to volunteer role listings as well.
- **Community-service tags** — Organizations can flag events as accepted community service work. Requires research into 501(c) qualification rules, as not all organizations legally qualify as community service employers.

### Events

- **Recurring events** — Refactor the event model to support repeating events on a weekly, monthly, or custom schedule. Alternatively, allow organizers to select specific dates from a calendar. Frontend views will need careful design.
- **Multi-date events** — Support events that span multiple days (e.g., a multi-day convention seeking volunteers across several shifts).
- **Event waitlist** — When an event reaches capacity, users can join a waitlist and be notified if a spot opens.
- **Imprecise addresses** — For security, precise event locations are hidden publicly. Only registered, verified attendees receive the full address.

### Organizations

- **Organization members** — Users can affiliate with an organization. Opens the door to role-based editing of org pages and events, moving away from organization-as-single-account. Member volunteers would be featured prominently as attendees, making it easier for newcomers to feel comfortable joining.
- **Volunteer role listings** — Organizations can post standing volunteer roles (part-time or full-time) in addition to one-off events. Listings would be surfaced on organization pages and in search, and could integrate into social media features if implemented.

### Trust & Safety

- **Verification** — Verification for both users and organizations. Prevents impersonation of legitimate ministries and orgs, and deters bad actors from registering for events. Complexity increases if non-profit verification is required for community service hour eligibility.
- **Volunteer hour tracking** — Users accumulate logged volunteer hours confirmed by the hosting organization. Hours display on user profiles as credibility signals and incentivize engagement. Likely requires QR code check-ins or similar confirmation. Ties closely into verification.
- **User reporting** — Users who repeatedly register for events but do not attend can be flagged or reported, protecting organization capacity.
- **Private profiles** — Users can opt to make their profile private, limiting visibility to the general public.

### Social

- **Social media layer** — Follow organizations, friend other users, and receive a personalized feed of organization posts (LinkedIn-style). Includes user reactions, comments, and forwarding. A basic messaging system for user-to-user and org-to-user communication. The largest scope item on the roadmap.
- **Notifications** — Email and push notifications for event reminders, cancellations, waitlist updates, and capacity alerts.

### Platform

- **Goodie AI** — An AI agent that acts as a first-class interface to Benevola. Not a chatbot — Goodie can perform any permitted API action on behalf of the user: searching events, registering for opportunities, updating availability, and more, without the user navigating the UI.
- **Dark mode** — A dark theme across all pages.

---

## Architecture Notes

- **Stateless API** — The Lambda function is stateless; all session context is encoded in the JWT. Database connection pooling is tuned for Lambda cold-start constraints (max 2 connections, 30s acquisition timeout).
- **Image uploads** — Clients request presigned S3 URLs from the API and upload directly to S3, keeping binary data off the Lambda function entirely.
- **Search** — Elasticsearch handles all discovery queries. The index uses edge-ngram analyzers for autocomplete and supports fuzzy matching, tag filtering, geographic radius queries, and date/time range filtering in a single request.
- **Dual auth model** — Users and organizations are separate principals stored in separate tables, each with their own registration, login, and token `kind` field (`"user"` or `"org"`). Middleware enforces which kind is allowed on each route.
