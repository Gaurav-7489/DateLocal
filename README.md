# Extrovert

> Connect your vibe, friends and more.

Extrovert is a standalone dating-first social platform. Dating and social discovery live in the same app, account and profile.

## Product model

- Google Sign-In only; no phone/password authentication.
- Optional identity verification and optional area verification.
- Unverified users retain full access.
- Identity verification can establish a real-person result and, where supported, validate claimed gender and age.
- Raw identity documents/selfies remain private; profiles expose only verification status.
- Supported launch areas: Waknaghat, Solan and Shimla.
- Exact coordinates are never exposed.
- Changing the selected area requires area verification again.
- Verified profiles receive higher discovery priority.
- Users choose Dating, Social or Both. Social-only users are exempt from dating verification.

## Dating

Discovery, nearby/area discovery, preferences, likes, passes, matches, match celebration, chat, unmatch, block, report, Super Likes and Beyond.

## Social

Social profile, people discovery, posts/content, connections and social interaction are integrated into the same Extrovert experience and are being shaped around dating-first people discovery.

## Technology

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Deployment | Vercel |

## Performance

Mobile-first and optimized for a high-refresh-rate feel: small payloads, optimized images, parallel data fetching, indexed discovery queries, lightweight loading states, minimal unnecessary client work and explicit user-facing error states.
