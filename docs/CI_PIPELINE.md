# CI Pipeline Documentation

## Overview

NGCrops uses GitHub Actions for continuous integration to ensure code quality and prevent regressions.

The CI pipeline includes:
1. **Linting** - ESLint code quality checks
2. **Build** - Next.js production build verification
3. **Type Checking** - TypeScript type safety
4. **Smoke Tests** - Basic SSR rendering tests

## Local Equivalent Commands

You can run the same checks locally before pushing:

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run production build
npm run build

# Run TypeScript type check
npx tsc --noEmit

# Start dev server (for smoke tests)
npm run dev

# In another terminal, run smoke tests
npm run test:smoke
```

## Running All Checks Locally

```bash
#!/bin/bash
echo "Running full CI suite locally..."

# Lint
echo "1. Linting..."
npm run lint

# Build
echo "2. Building..."
npm run build

# Type check
echo "3. Type checking..."
npx tsc --noEmit

echo "✓ All checks passed locally!"
```

## Smoke Tests

Smoke tests verify that critical routes render without errors.

### Tested Routes

- `/auth/signin` - Sign-in page (public, no auth required)
- `/` - Market/home page (expects 200 or 303 redirect if not authenticated)
- `/api/health` - Health check endpoint

### Running Smoke Tests

**Option 1: With running dev server**
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:smoke
```

**Option 2: In CI/Background**
The CI workflow handles starting the server automatically.

## CI Configuration

The CI workflow is defined in `.github/workflows/ci.yml`.

**Triggers:**
- Push to `main`, `develop`, or any `feat/*` branch
- Pull requests to `main` or `develop`

**Jobs:**
- `lint-and-build` - Runs linter and build
- `smoke-tests` - Runs smoke tests against dev server
- `type-check` - Runs TypeScript type checking
- `status-check` - Ensures all critical jobs passed

## Node Version

The pipeline uses Node.js 22.x. Make sure your local environment matches:

```bash
node --version
# Should output v22.x.x

# To set in package.json:
"engines": {
  "node": "22.x"
}
```

## Failure Resolution

If CI fails:

1. **Lint errors**: `npm run lint` and fix formatting issues
2. **Build errors**: Check console for TypeScript/transpilation issues
3. **Type errors**: `npx tsc --noEmit` to see type issues
4. **Smoke test failures**: Ensure dev server is running and responding

## Future Improvements

- Add unit tests for business logic
- Add integration tests for API endpoints
- Add visual regression tests
- Add performance budgets
- Add automated security scanning
