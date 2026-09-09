# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OurGoals** is a couples bucket-list app. Partners share categories and items, each rate items 1–5 independently, and the app computes a match score. The design source lives in `prototype/design_handoff_couples_bucket_list/README.md` — consult it for screen layout, design tokens, and feature spec.

## Backend (`backend/`)

**Stack:** Node.js + Express + TypeScript + MongoDB (Mongoose)

### Commands

```bash
# Development (hot reload)
npm run dev

# Type-check without emitting
npx tsc --noEmit

# Build for production
npm run build
npm start
```

### Environment

Copy `.env.example` to `.env` and fill in:
- `MONGODB_URI` — local or Atlas connection string
- `JWT_SECRET` — long random string
- `GOOGLE_CLIENT_ID` — from Google Cloud Console
- `APPLE_BUNDLE_ID` — from Apple Developer Portal
- SMTP settings for partner invite emails

### Architecture

```
src/
  config/       env.ts (typed env vars), db.ts (Mongoose connect)
  middleware/   auth.ts (JWT guard + requireCouple), errorHandler.ts
  models/       User, Couple, Category, Item, Rating
  routes/       auth, users, partner, categories, items, match, progress
  services/     tokenService, emailService, matchService
  app.ts        Express app wiring
  server.ts     DB connect + listen
```

### Data model

- **Couple** — links two users; created when one invites the other, `status: pending → accepted`. All shared data (categories, items, ratings) is scoped by `coupleId`.
- **Category** — belongs to a couple. The `Sexuality` category is system-managed (`isSystem: true`) and toggled via `POST /categories/sexuality`.
- **Item** — belongs to a category and couple.
- **Rating** — per-user, per-item (1–5). Unique index on `(userId, itemId)` — upsert on update.

### Key API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Email/password signup |
| POST | `/auth/login` | — | Email/password login |
| POST | `/auth/google` | — | Google ID token exchange |
| POST | `/auth/apple` | — | Apple identity token exchange |
| GET/PUT | `/users/me` | JWT | Profile + preferences (name, theme, sexualityEnabled) |
| DELETE | `/users/me` | JWT | Delete account + all couple data |
| POST | `/partner/invite` | JWT | Send partner invite (email); creates Couple record |
| GET | `/partner/accept/:token` | — | Validate token (for deep-link redirect) |
| POST | `/partner/accept/:token` | JWT | Authenticated partner accepts invite |
| GET | `/partner` | JWT | Current partner info + invite status |
| GET/POST | `/categories` | JWT | List / create categories |
| DELETE | `/categories/:id` | JWT | Delete (only if 0 items) |
| POST | `/categories/sexuality` | JWT | `{ enabled: boolean }` — toggle system category |
| GET/POST | `/categories/:id/items` | JWT | List / create items |
| GET/DELETE | `/categories/:id/items/:itemId` | JWT | Item detail / delete |
| PUT | `/categories/:id/items/:itemId/rating` | JWT | `{ value: 1–5 }` — upsert my rating |
| GET | `/match` | JWT+couple | Match score + shared high items + per-category breakdown |
| GET | `/progress` | JWT | My rating progress overall + per category |

### Match scoring

`matchService.ts`: for each item both partners rated, score = `max(0, 1 − |diff| × 0.25)`. Per-category and overall percentages are averages of these scores. "Shared high items" = both rated ≥ 4.

### Auth flow for partner invite

1. User A calls `POST /partner/invite` with `{ contact: "email@..." }` → Couple created (pending), email sent with `inviteToken`.
2. Partner clicks link → `GET /partner/accept/:token` returns token info.
3. Partner registers/logs in, then calls `POST /partner/accept/:token` → Couple status becomes `accepted`, both users get `coupleId`.
