# Extrovert Architecture

Extrovert is one standalone application and one product identity. Dating is the core experience; social discovery is integrated into the same account and profile.

## Product boundary

- **Extrovert owns everything:** Google authentication, profile, identity verification, area verification, social discovery, social connections, dating discovery, likes/passes, matches, dating chat, safety, premium and rewards.
- There is no DateLocal application dependency, no second identity authority and no cross-app authentication bridge.
- Exact coordinates are never exposed to users.

## Authentication

Google Sign-In is the only authentication method. The OAuth callback exchanges the Google authorization code directly in the Extrovert Supabase project and routes the user to profile setup or the app. Phone/password authentication is not part of the product.

## Verification

Identity verification is optional. It can establish a real-person result and, where the provider supports it, validate claimed gender and age. Raw documents/selfies are private; the public profile exposes only the verification result.

Area verification is optional and currently supports Waknaghat, Solan and Shimla. The exact user location is never displayed. Changing the selected area requires verification again.

Unverified users retain full access. Verified profiles receive a discovery-priority boost as a trust signal.

## Profile modes

`experience_mode` is `dating`, `social`, or `both`. Social-only users are not required to complete dating verification.

## Data model

The canonical identity/profile foundation is `extrovert.profiles`. Dating activity, social interactions, conversations and safety records remain in the same Supabase project. Private verification result metadata is isolated in `extrovert.identity_verification_results` with RLS; raw verification artifacts are not stored there.

## Performance contract

Mobile-first and optimized for a high-refresh-rate feel: server-side data fetching where practical, parallel Supabase requests, small payloads, indexed discovery filters, minimal global client state, transform/opacity animation, lightweight loading states, optimized images and explicit operation errors. Avoid continuous animation, heavy blur and unnecessary client JavaScript.

## Deployment contract

The GitHub repository remains `Gaurav-7489/DateLocal`; the deployed product identity is Extrovert. Supabase is the single backend. Vercel serves the Next.js application.
