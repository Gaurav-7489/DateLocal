# DateBu

> A private university-exclusive social and dating platform.

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Runtime | Node.js 22 LTS |
| Deployment | Vercel |

## Local Development

### Prerequisites

- Node.js 22 LTS (`nvm use 22`)
- npm 10+

### Setup

```bash
nvm use 22
npm install
cp .env.example .env.local
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
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never expose it to the client
- Never commit `.env.local` or real secrets

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the application architecture and security boundaries.

## Current Product

DateBu is a university-exclusive social/dating platform with:
- Free discovery, matching, chat, safety, and profile features
- 7 starter likes, then 2 likes/day for free accounts
- DateBu Extrovert with 10 likes/day plus visibility and control features
- One-time Shop purchases for extra likes and SuperChat
- Profile views and incoming likes with Extrovert identity unlocks
- PWA installation, haptics, and push notifications
- Personal activity insights for Extrovert users

## Security

- `server-only` guards privileged admin Supabase access
- RLS protects user-owned data
- Service role keys remain server-only
- Profile discovery/viewing uses controlled RPCs
- Payment fulfillment is server-side and signature verified
