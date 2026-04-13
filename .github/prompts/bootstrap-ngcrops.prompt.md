---
description: "Use when bootstrapping the NGCrops App Router architecture, MongoDB helpers, Yoxo client, sync route, or dark dashboard UI."
name: "bootstrap-ngcrops"
argument-hint: "Inspect the repo and scaffold the initial NGCrops MVP"
agent: "agent"
---
Inspect the repository first, then scaffold or refine the initial NGCrops MVP.

Follow the workspace instructions in [AGENTS.md](../../AGENTS.md) and keep the implementation aligned with the existing Next.js App Router + TypeScript + Tailwind + shadcn/ui stack.

Build the project around these rules:
- Keep the architecture split into `src/app`, `src/application`, `src/infrastructure`, `src/domain`, and `src/lib`.
- Add MongoDB helpers that are safe for server-side use and suitable for idempotent upserts.
- Add a Yoxo API client that validates external payloads before they reach the app.
- Add normalization logic for market snapshots with deterministic keys.
- Add a safe sync route that requires a shared secret, avoids duplicate syncs, and only accepts odd-day snapshots.
- Build a dark dashboard home page with shadcn/ui components and a readable, production-oriented layout.
- Keep recommendations deterministic, with BUY/HOLD/SELL outputs that include reasons and confidence scores.

When making changes:
- Prefer small, focused files and reuse existing components and utilities when possible.
- Validate the implementation with the repo's existing lint and build commands when relevant.
- Preserve the current design language instead of introducing a new visual system.
- Avoid duplicating conventions already captured in [AGENTS.md](../../AGENTS.md); link to that file instead.

If the repository already contains some of these pieces, inspect them and improve or complete them rather than recreating them from scratch.
