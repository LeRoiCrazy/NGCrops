# NGCrops repository instructions

This repository contains a Next.js App Router application deployed on Vercel.

## Stack
- TypeScript
- Next.js App Router
- Tailwind CSS
- shadcn/ui
- MongoDB native driver
- Zod
- Recharts

## Domain rules
- This app tracks NationsGlory cereal market data.
- Source data comes from the Yoxo API cereal global market endpoint.
- The source market refresh happens on odd days of the month.
- We store snapshots instead of spamming the API.
- Sync logic must be idempotent.
- Only one snapshot per server per snapshot date.
- Recommendations must be deterministic, explainable, and conservative.

## Architecture rules
- Prefer server components by default.
- Keep business logic in src/lib.
- Keep route handlers in src/app/api/**/route.ts.
- Keep UI components in src/components.
- Validate external data with Zod.
- No fake AI logic, no invented metrics.

## UI rules
- Dark mode first.
- Use shadcn/ui components whenever possible.
- Show BUY / HOLD / SELL badges.
- Show confidence and reasons.