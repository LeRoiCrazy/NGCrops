# Project Guidelines

## Code Style
- Use TypeScript with strict types, App Router server components by default, and explicit `"use client"` only when state or browser APIs are required.
- Prefer small, composable modules and keep reusable business logic in [src/lib](src/lib).
- Follow the existing UI pattern in [src/components/ui](src/components/ui): `cn()` for class merging, CVA for variants, and `data-slot` attributes for styling hooks.
- Keep external payload handling schema-driven with Zod before any persistence or display.

## Architecture
- This repo is a Next.js App Router app. Pages and route handlers live in [src/app](src/app); server-only data access and integrations belong in [src/infrastructure](src/infrastructure); application use cases belong in [src/application](src/application); domain types and invariants belong in [src/domain](src/domain).
- Keep sync flows idempotent. For market ingestion, use deterministic snapshot keys and upsert semantics instead of inserts.
- Keep the dashboard readable and dark themed; preserve the established design language instead of introducing a new one.
- Treat the Yoxo API as the upstream source of truth and avoid unnecessary calls.
- The market model stores one snapshot per server per date; dedupe on that unit, not on raw payload identity.
- BUY/HOLD/SELL recommendations must be deterministic, include a confidence score, and explain the main reasons behind the decision.

## Build and Test
- Install and run the app with `npm run dev`.
- Validate changes with `npm run lint` and `npm run build` before handing off.
- Use MongoDB locally or in the deployment environment; provide the required environment variables before exercising the sync route.
- The project is deployed on Vercel, so keep runtime code compatible with the Node version configured there.

## Conventions
- Keep route handlers safe by requiring a shared secret and validating request payloads before mutation.
- For sync or ingestion work, prefer odd-day snapshots only and reject or skip the rest explicitly.
- Do not duplicate instructions that are already covered here or in the README; link to the relevant file instead.
- Preserve the current path alias `@/*` and the existing shadcn/Base UI hybrid component structure.