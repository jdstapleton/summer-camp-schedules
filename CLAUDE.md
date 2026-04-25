# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Setup

```bash
npm ci
npm run dev
```

## Common Commands

- **`npm run dev`** — Start Vite dev server (opens at http://localhost:5173)
- **`npm run build`** — Build for production (outputs to `dist/`)
- **`npm run preview`** — Preview production build locally
- **`npm run lint`** — Check TypeScript/React code with ESLint
- **`npm run lint:fix`** — Auto-fix ESLint issues
- **`npm run format`** — Format code with Prettier
- **`npm test`** — Run tests in watch mode
- **`npm run test:run`** — Run tests once and exit

## Architecture

### Core Structure

- **`src/main.tsx`** — Application entry point, mounts React app to DOM
- **`src/App.tsx`** — Root component; contains page layout and state management

### Organization

- **`src/components/`** — Reusable React functional components
- **`src/hooks/`** — Custom React hooks for shared logic
- **`src/services/`** — Utility functions and external API integrations (file operations, HTTP clients, etc.)
- **`src/contexts/`** — React Context providers for global state
- **`src/models/`** — TypeScript type definitions and interfaces

### Testing

- Tests live beside the code they test (e.g., `Component.spec.tsx` next to `Component.tsx`)
- Vitest for unit/component testing with jsdom for DOM simulation
- Use `@testing-library/react` for component testing

## Key Technologies & Configuration

- **git** - scm; should have git ignore file with the common ignores for a project of this type
- **TypeScript** — Latest version; Strict mode enabled (`tsconfig.json`)
- **React** — Latest version; functional components with named exports only
- **Vite** — Fast build tool with dev server and HMR
- **Vitest** — Fast unit test runner with jsdom environment
- **ESLint** — eslint V9. Flat config format (ESLint v9+); lints TypeScript and React code
- **Prettier** — Enforces consistent code formatting (80 char line width, single quotes)
- **MUI** — Latest version; Material-UI for components and styling via emotion
- **TanStack Router** — For client-side routing (setup in App.tsx as needed)

## Data Schema & Migrations

The app uses a versioning system for the `ScheduleData` model:

- **Current schema version**: 7
- **Migration system**: `src/services/dataMigrations.ts`
- **Sample data**: `sample-data.json` (always at current version)

`migrateData()` rejects any data older than `CURRENT_VERSION` and throws — there is no backwards-compatibility migration chain. It also normalizes negative responses (e.g. "No", "None") in `medicalIssues` and `specialRequest`.

### When to add a new schema version:

1. Update the type definition in `src/models/types.ts`
2. Increment `CURRENT_VERSION` in `src/services/dataMigrations.ts`
3. Adjust the normalization step in `migrateData()` if any new fields need defaults
4. Update `sample-data.json` to the new version with the new fields
5. Update the `version` literal in `emptyData` in `src/contexts/ScheduleProvider.tsx`

Data is rejected (or migrated, where applicable) when:

- Loading from localStorage on app startup
- Importing a saved schedule file

## Important Rules

- **Named exports only** — Never use default exports; import/export with explicit names
- **Functional components** — All React components must be functional, using hooks
- **Path alias** — Use `@/` prefix for imports from `src/` (e.g., `@/components/Button`)
