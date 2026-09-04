# Extrovert product boundary

Extrovert is one standalone product: a dating-first people discovery platform with an integrated social experience.

## Experiences

- **Dating** — discover compatible local people, like/pass, match, chat, use dating preferences, Super Likes, Beyond and dating safety tools.
- **Social** — maintain a social profile, discover people, post/content, connect and interact socially. Social-only users can use this experience without dating verification.

These are experiences inside the same Extrovert app and account. There is no second Extrovert social app and no DateLocal/Extrovert handoff.

## Authentication

Google Sign-In is the only authentication method. Extrovert does not require a phone number, password, or separate dating account.

## Verification

Identity and area verification are optional. Skipping verification never blocks the core app. Identity verification may establish that a person is real and, where supported by the verification provider, validate claimed gender and age. Area verification confirms the selected supported locality.

Public profiles show only verification results: **Identity Verified** and **Area Verified**. Raw identity documents and selfies are private and are never shown to other users.

Supported areas for the current launch are **Waknaghat, Solan and Shimla**. Exact coordinates are never exposed to other users. Changing the selected area requires area verification again.

Verified profiles receive higher discovery priority as a trust signal; unverified profiles retain full access.

## Profile modes

A user can choose **Dating**, **Social**, or **Both**. Social-only users are exempt from dating verification requirements.

## Privacy and safety

Exact location is never public. Verification artifacts remain private. Users retain block, report and unmatch controls.

## Performance

The app is mobile-first and optimized for a high-refresh-rate feel: minimal client JavaScript, lightweight loading states, optimized images, indexed discovery queries, efficient RLS policies, and explicit user-facing error states instead of indefinite spinners.
