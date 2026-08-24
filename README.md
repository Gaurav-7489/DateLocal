# [PROJECT_NAME]

> A private university-exclusive social and dating platform.

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Runtime | Node.js 22 LTS |
| Deployment | Vercel (planned) |

## Local Development

### Prerequisites

- Node.js 22 LTS (`nvm use 22`)
- npm 10+

### Setup

```bash
# Switch to Node 22
nvm use 22

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

**Security rules:**
- Variables prefixed `NEXT_PUBLIC_` are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — **never** expose to the client
- Never commit `.env.local` or any file containing real secrets

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full architecture overview.

### Project Structure

```
src/
├── app/               # Next.js App Router pages
│   ├── (public)/      # Public pages (about, safety, privacy, terms)
│   ├── (auth)/        # Auth pages (login, register, verify)
│   ├── (app)/         # Authenticated app pages (discover, matches, etc.)
│   └── admin/         # Admin pages (not linked from student UI)
├── components/
│   ├── ui/            # Primitives (Button, Input, Card)
│   ├── layout/        # Shell components (Navbar, Footer, PageContainer)
│   └── shared/        # State components (Loading, Empty, Error)
├── config/            # Centralized configuration
├── lib/               # Core libraries
│   └── supabase/      # Supabase client architecture
└── types/             # TypeScript type definitions
```

### Design System

University branding is centralized in:
- `src/app/globals.css` — CSS design tokens via Tailwind v4 `@theme`
- `src/config/university.ts` — runtime university configuration

Change the university identity by updating CSS variables and env vars — no component rewrites needed.

## Supabase

Supabase is used for:
- PostgreSQL database
- Authentication
- File storage
- Realtime subscriptions

**Not yet connected.** Database schema and migrations will be created in later phases.

## Security

- `server-only` package guards the admin Supabase client from browser import
- RLS will be enabled on all tables (future phases)
- Service role key restricted to server-side only
- Admin routes are not linked from student navigation

## Deployment

The project is prepared for Vercel deployment but **not yet deployed**.

```bash
# Verify production build works
npm run build
```

## Current Phase

**Phase 1 — Foundation** (current)

Subsequent phases: Authentication → Verification → Profiles → Discovery → Matching → Chat → Safety → Admin → Polish → Campus → AI → Production
