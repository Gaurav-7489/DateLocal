# Architecture — Phase 1 Foundation

## Overview

This document describes the implemented Phase 1 foundation architecture.

## Design Decisions

### Tailwind CSS v4 with `@theme`

Tailwind v4 uses a CSS-first configuration model. Design tokens are declared
directly in `globals.css` using the `@theme` directive. This replaces the
`tailwind.config.ts` approach from v3.

University branding colors are defined as `--color-uni-primary-*` and
`--color-dept-accent-*` tokens, making them available as Tailwind utility
classes (e.g., `bg-uni-primary`, `text-dept-accent`).

### Supabase Client Architecture

Three separate Supabase client factories:

| Client | File | Key | Usage |
|---|---|---|---|
| Browser | `lib/supabase/client.ts` | Anon | Client components |
| Server | `lib/supabase/server.ts` | Anon | Server components, actions |
| Admin | `lib/supabase/admin.ts` | Service role | Server-only privileged ops |

The admin client is protected by the `server-only` package, which causes a
build error if any client component tries to import it.

### Route Architecture

Routes are organized into groups:

- `(public)` — unauthenticated informational pages
- `(auth)` — authentication flow pages
- `(app)` — authenticated application pages
- `admin` — administrative pages (not a route group, deliberately separate)

### Creator Invisibility

The admin section:
- Has no link from the public navbar, footer, or any student-facing page
- Uses a separate header without the public brand nav
- Does not display any creator name, email, role, or identity
- Is marked `noindex` to prevent search engine discovery
- Will be protected by server-side role checks in Phase 9

### Security Boundaries

```
BROWSER (client components)
│
├── lib/supabase/client.ts    ← ANON key only
├── components/*              ← No access to service role
│
─── BOUNDARY (server-only import guard) ───
│
SERVER (server components, actions, API routes)
│
├── lib/supabase/server.ts    ← ANON key + cookies
├── lib/supabase/admin.ts     ← SERVICE ROLE (bypasses RLS)
│
```

### Mobile Compatibility

Business logic will live in `src/services/` (future phases), not inside
React components. The Supabase client architecture is SDK-based, meaning
a React Native app can use the same Supabase JS SDK against the same
backend.

## Not Implemented (by design)

- Authentication
- Database schema / migrations
- Profiles, discovery, matching, chat
- Blocking, reporting, moderation
- AI systems
- Real admin operations
- Production deployment

These belong to Phases 2–13.
