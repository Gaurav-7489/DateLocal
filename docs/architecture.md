# DateLocal ↔ Extrovert Architecture

## Product boundary

DateLocal is the dating layer. Extrovert is the identity and local-social foundation.

- **Extrovert owns:** authentication/identity, verification, local area, social discovery, connections and platform safety.
- **DateLocal owns:** dating profile/preferences, romantic discovery, likes/passes, matches, dating chat, dating notifications, premium, SuperChat and dating rewards.
- DateLocal must not create a second identity or second authentication authority.
- Exact coordinates are never exposed; locality remains area-level.

## Authentication authority

Extrovert is the source of truth for the user's identity session. DateLocal login/register entry points send the user to Extrovert. After a verified Extrovert session exists, Extrovert creates a short-lived, single-use bridge in the shared Supabase project. DateLocal consumes that bridge and establishes the same Supabase user session.

The bridge contains only server-side session material and is never placed directly in a URL as an access token. The URL contains a short-lived opaque code that is hashed before lookup.

## Shared backend

Both applications use the same Supabase project and the same `auth.users` identity. Extrovert owns the cross-app handoff table. DateLocal owns its dating tables and does not duplicate identity records.

The canonical bridge table is `extrovert_datelocal_auth_bridges`.

## Session flow

```text
User
 │
 ▼
Extrovert
 │  authentication + verification + local identity
 │
 │  one-time bridge code
 ▼
DateLocal /auth/extrovert
 │
 │  consume bridge + set same Supabase session
 ▼
DateLocal
 │
 ├── dating profile/preferences
 ├── discovery / likes / matches
 ├── dating messages
 └── premium / rewards
```

## Safety boundary

DateLocal may use the Extrovert identity to decide whether a user is eligible to enter the dating layer. It must not weaken Extrovert trust/ban state or expose Extrovert-only identity data that is not required for dating.

## Deployment contract

Set `EXTROVERT_URL` in DateLocal to the deployed Extrovert origin and `NEXT_PUBLIC_DATELOCAL_URL` in Extrovert to the deployed DateLocal origin. Keep the Supabase URL/key pair aligned between both applications.
