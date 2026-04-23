# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Application Purpose
The name of this application is `summer-camp-schedules`.  This is an application to help a director of a summer camp who manages many summer camp classes pick which class each student who has signed up to go to which class.
There are many 'types' of classes, like 'Minecraft Programming', 'Little Chemist', 'Eco Explorer', 'Coding with Roblox', 'Jr Space Explorer'.
Each class has a limited number of students who can be in it.  If a class has more than that limit, there would be more than 1 instance of that class running at the same time.  For example if 20 kids signed up for 'Little Chemist' and the max class size is 16, then there should be 2 classes of about 10 students each.
For classes that have multiple instances, should prefer to keep the girls and boys seperated, though they are allowed to mix.  Also should allow specifying some students to be in the same instance of a class, since they may be friends, and want to be in the same class. 

## Setup

```bash
npm install
npm run dev
```

## Common Commands

- **`npm run dev`** — Start Vite dev server (opens at http://localhost:5173)
- **`npm run build`** — Build for production (outputs to `dist/`)
  - Should not have tsc output js files, just use it for type safety checking
- **`npm run preview`** — Preview production build locally
- **`npm run lint`** — Check TypeScript/React code with ESLint
- **`npm run lint:fix`** — Auto-fix ESLint issues
- **`npm run format`** — Format code with Prettier
- **`npm test`** — Run tests in watch mode
- **`npm run test:run`** — Run tests once and exit
- **`npx vitest run src/App.spec.tsx`** — Run a single test file

## Architecture

### Core Structure
- **`src/main.tsx`** — Application entry point, mounts React app to DOM
- **`src/App.tsx`** — Root component; contains page layout and state management
- **`src/index.css`** — Global styles

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
- **ESLint** — eslint V9.  Flat config format (ESLint v9+); lints TypeScript and React code
- **Prettier** — Enforces consistent code formatting (80 char line width, single quotes)
- **MUI** — Latest version; Material-UI for components and styling via emotion
- **TanStack Router** — For client-side routing (setup in App.tsx as needed)

## Important Rules

- **Named exports only** — Never use default exports; import/export with explicit names
- **Functional components** — All React components must be functional, using hooks
- **Path alias** — Use `@/` prefix for imports from `src/` (e.g., `@/components/Button`)
- **No unused code** — ESLint enforces `noUnusedLocals` and `noUnusedParameters`
- **Strict types** — All TypeScript files run in strict mode; no `any` types without justification

## JSON File Handling

The app includes built-in file operations via `src/services/fileService.ts`:
- **`fileService.openFile()`** — Opens system file picker, reads and parses JSON files
- **`fileService.saveFile(data, filename)`** — Downloads JSON data as a file to the user's device

The `App.tsx` demo shows a simple JSON editor that can open, edit, and save JSON files.
