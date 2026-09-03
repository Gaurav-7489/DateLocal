# DateLocal ↔ Extrovert Architecture

## Product boundary

DateLocal is the dating experience. Extrovert is the identity, verification and local-social foundation.

- **Extrovert owns:** authentication/identity, shared profile fields, verification, local area, social discovery, social connections and platform safety.
- **DateLocal owns:** dating profile content, dating preferences, romantic discovery, likes/passes, matches, dating chat, dating notifications, premium, SuperChat and dating rewards.
- DateLocal must not create a second identity or second authentication authority.
- Shared identity fields shown in DateLocal are read-only. Users change them in Extrovert.
- Exact coordinates are never exposed; locality remains area-level.

## Shared identity fields

Extrovert is authoritative for name, date of birth, gender, department, academic year, shared bio/interests and selected local area. DateLocal may mirror the fields it needs for efficient dating queries, but the database trigger prevents DateLocal writes from becoming a different identity.

Changing a core identity field in Extrovert can invalidate the relevant verification state: identity changes reset face verification to pending; changing the selected area resets area verification to pending. Trust/ban state is preserved.

## Authentication authority

Extrovert is the source of truth for the user's identity session. DateLocal login/register entry points send the user to Extrovert. After authentication, Extrovert creates a short-lived, single-use bridge in the shared Supabase project. DateLocal consumes that bridge and establishes the same Supabase user session.

The bridge contains only server-side session material. The browser receives an opaque short-lived code, which is hashed before lookup and consumed once.

## Shared backend

Both applications use the same Supabase project and the same `auth.users` identity. Extrovert owns the cross-app handoff table and shared identity. DateLocal owns dating tables and dating activity.

The canonical bridge table is `extrovert_datelocal_auth_bridges`.

## User flow

```text
User chooses DateLocal
        │
        ▼
Extrovert authentication / verification
        │
        │ secure one-time bridge
        ▼
DateLocal
        │
        ├── dating profile + photos
        ├── dating preferences
        ├── discovery / likes / passes / matches
        ├── dating chat
        └── premium / rewards
```

If the user opens Extrovert directly, the same authentication flow returns to Extrovert. If the user started in DateLocal, the original DateLocal destination is preserved through Google login, setup and verification.

## Admin data boundary

DateLocal admin can read the shared Supabase integration state needed to operate the dating platform: linked identity counts, verification coverage, social connection counts, local-area counts and active authentication handoffs, alongside dating metrics. This is operational visibility, not ownership of those records.

Extrovert admin remains the authority for identity, verification, local-social data and trust/safety operations.

## Performance contract

Keep the apps mobile-first and light: server-side data fetching where practical, parallel Supabase requests, small responses, indexed filters, no unnecessary global client state, transform/opacity animations, lightweight skeletons and precise inline errors. Avoid heavy blur, oversized shadows and continuous animation. Loading states should communicate the exact operation rather than showing a blank screen.

## Deployment contract

Set `EXTROVERT_URL` in DateLocal to the deployed Extrovert origin and `NEXT_PUBLIC_DATELOCAL_URL` in Extrovert to the deployed DateLocal origin. Keep the Supabase URL/key pair aligned between both applications.
