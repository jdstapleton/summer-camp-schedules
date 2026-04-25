# Summer Camp Schedules

A modern web application for managing student registrations and camp activity schedules, and allow exporting to printable reports that camp directors can use during the camp. Built with React, TypeScript, and Material-UI.

This was mainly an application to teach myself the general workflow of coding with CLAUDE. 

## Features

- **Student Management** — Add and manage student information including medical issues and special requests
- **Camp Management** — Create and configure camp programs with age groups and activity slots
- **Registration System** — Register students for camp activities with availability tracking
- **Smart Scheduling** — Generate optimized schedules based on student registrations
- **Data Persistence** — Save and export schedules to local storage and Excel files
- **Responsive Design** — Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 24+ and npm

### Setup

```bash
npm ci
npm run dev
```

The app will open at `http://localhost:5173`

## Available Scripts

- **`npm run dev`** — Start Vite dev server with hot module reloading
- **`npm run build`** — Build for production (outputs to `dist/`)
- **`npm run preview`** — Preview production build locally
- **`npm run lint`** — Check TypeScript/React code with ESLint
- **`npm run lint:fix`** — Auto-fix ESLint issues
- **`npm run format`** — Format code with Prettier
- **`npm test`** — Run tests in watch mode
- **`npm run test:run`** — Run tests once and exit
- **`npm run test:coverage`** — Generate test coverage report

## Technology Stack

- **React 19** — UI framework with functional components and hooks
- **TypeScript** — Static type checking
- **Vite** — Fast build tool and dev server
- **Material-UI (MUI)** — Component library and theming
- **TanStack Router** — Client-side routing
- **Vitest** — Unit testing with jsdom
- **ExcelJS** — Excel file export functionality
- **Day.js** — Date manipulation
- **Emotion** — CSS-in-JS styling

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── dashboard/      # Dashboard page and components
│   ├── students/       # Student management UI
│   ├── camps/          # Camp management UI
│   ├── registrations/  # Registration UI
│   ├── schedule/       # Schedule display and management
│   ├── layout/         # Layout and navigation
│   └── shared/         # Shared components (ErrorBoundary, etc.)
├── hooks/              # Custom React hooks
├── services/           # Utility functions and APIs
│   └── dataMigrations.ts  # Data versioning and migrations
├── contexts/           # React Context providers
├── models/             # TypeScript types and interfaces
├── App.tsx            # Root component with routing
└── main.tsx           # Application entry point
```

## Data Management

The app uses a versioning system for data schema management:

- **Current schema version**: 7
- **Storage**: Browser localStorage and imported JSON files
- **Migrations**: Automatic migration when loading data from disk or import

### Data Migration

The `migrateData()` function in `src/services/dataMigrations.ts` handles schema versions:

- Rejects data older than `CURRENT_VERSION`
- Normalizes negative responses (e.g., "No", "None") in medical issues and special requests
- Applies field defaults for new versions

### Adding a New Schema Version

1. Update type definitions in `src/models/types.ts`
2. Increment `CURRENT_VERSION` in `src/services/dataMigrations.ts`
3. Add normalization logic if new fields need defaults
4. Update `sample-data.json` to the new version
5. Update `emptyData` version in `src/contexts/ScheduleProvider.tsx`

## Testing

This project uses Vitest for unit and component testing with `@testing-library/react`:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage
```

Test files are colocated with their corresponding source files:

- `Component.tsx` → `Component.spec.tsx`
- `hook.ts` → `hook.spec.ts`

## Building for Production

```bash
npm run build
npm run preview
```

The production build is optimized and output to the `dist/` directory.

## Contributing

- Follow the code standards outlined above
- Ensure all tests pass and ESLint checks are clean
- Format code with Prettier before committing
- Keep components focused and reusable

## License

MIT
