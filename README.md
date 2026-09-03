# Extrovert

> Connect your vibe, friends and more.

This repository contains the **Extrovert Date** experience: the optional dating layer of the Extrovert product. Extrovert is one identity and one product with two connected experiences: **Extrovert Social** and **Extrovert Date**.

## Product model

### Extrovert Social
- One verified identity and authentication
- People and local discovery
- Social connections and social chats
- Privacy-safe area/location context
- Verification, blocking, reporting and safety

### Extrovert Date
- Optional dating profile
- Dating discovery and contextual profile cards
- Dating preferences, likes, passes and matches
- Dating chat and notifications
- Super Likes and reward-token foundation
- **Beyond** premium experience

A person is not included in dating discovery until they create and complete their Extrovert Date profile.

## Shared identity

Extrovert is the source of truth for identity. Name, date of birth, gender, identity type, education/work context, verification and local area are supplied by Extrovert and are read-only in Extrovert Date.

The identity flow supports everyone while remaining student-first:
- Students get college/university, course/department, academic year and field-of-study context.
- Professionals get job/role and organisation context.
- Other users can describe their current role or situation.

Dating-specific information such as photos, bio, interests, relationship goal, dating preferences and prompts belongs to Extrovert Date.

## Brand language

- Product: **Extrovert**
- Tagline: **Connect your vibe, friends and more**
- Social experience: **Extrovert Social**
- Dating experience: **Extrovert Date** / **Extrovert (your location) Date**
- Premium: **Beyond**

## Technology

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Deployment | Vercel |

## Local development

```bash
nvm use 22
npm install
npm run dev
```

Available scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run type-check`.

## Reliability

- Production never falls back to localhost URLs.
- Unhandled route errors use a branded recovery screen rather than a blank page.
- Server-side failures stay in server logs while users receive a clear recovery message.
- Authentication and identity handoff use server-side Supabase sessions and one-time bridge codes.
- Exact physical coordinates are never exposed to other users.

## Security

- RLS protects user-owned data.
- Service-role access remains server-only.
- Identity authority is enforced in Supabase, not just in the UI.
- Dating discovery requires a completed dating profile.
- Premium and interaction limits are decided server-side.
- Super Like rewards are separate from chat features.
