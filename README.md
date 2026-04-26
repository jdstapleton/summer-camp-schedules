# Summer Camp Schedules

A modern web application for managing student registrations and camp activity schedules, and allow exporting to printable reports that camp directors can use during the camp. Built with React, TypeScript, and Material-UI.

This was mainly an application to teach myself the general workflow of coding with CLAUDE.

## Features

- **Student Management** — Add and manage student information including medical issues and special requests
- **Camp Management** — Create and configure camp programs with age groups and activity slots
- **Registration System** — Register students for camp activities with availability tracking
- **Smart Scheduling** — Generate optimized schedules based on student registrations
- **Real-time Collaboration** — Multiple team members can edit simultaneously; changes sync instantly via Supabase
- **Data Persistence** — Stored in Supabase PostgreSQL with magic link authentication
- **Data Export** — Save and export schedules to Excel files and JSON backups
- **Responsive Design** — Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 24+ and npm
- Supabase account (free tier at [supabase.com](https://supabase.com))

### Setup — Local Development

```bash
npm ci
npm run dev
```

The app will open at `http://localhost:5173` and prompt for login via email magic link.

### Setup — Supabase Configuration

The app uses Supabase for real-time collaborative data storage. Follow these steps **once** to set up your project:

#### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project**
3. Fill in: project name, database password, region
4. Wait ~2 minutes for provisioning

#### Step 2: Initialize the Database

1. In Supabase dashboard, open **SQL Editor**
2. Click **New query** and paste:

```sql
-- Create schedule data table
CREATE TABLE schedule_data (
  id         text        PRIMARY KEY DEFAULT 'main',
  data       jsonb       NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

-- Insert empty placeholder
INSERT INTO schedule_data (id, data)
VALUES ('main', '{"version":7,"students":[],"camps":[],"registrations":[],"schedule":null}');

-- Enable Row Level Security
ALTER TABLE schedule_data ENABLE ROW LEVEL SECURITY;

-- Authenticated users only
CREATE POLICY "authenticated users only"
  ON schedule_data
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON schedule_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Realtime (required for multi-user sync)
ALTER TABLE schedule_data REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_data;
```

3. Click **Run**

#### Step 3: Configure Authentication

1. Go to **Authentication → Providers** and enable **Email**
   - Disable email confirmation (allow magic links)
2. Go to **Authentication → URL Configuration**
   - Set **Site URL** to `http://localhost:5173` (or your production URL)
   - Add the same to **Redirect URLs**
3. Go to **Authentication → Settings**
   - Enable **Disable sign ups** (invite-only)

#### Step 4: Get Credentials and Create `.env.local`

1. Go to **Project Settings → API**
2. Copy **Project URL** and **anon public** key
3. Create `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Never commit `.env.local` — it's gitignored for security.**

#### Step 5: Test Real-time Sync

1. `npm run dev` in two terminal windows or two browser tabs
2. Log in with your email (you'll receive magic links)
3. Edit a student in one session → confirm it appears in the other within ~2 seconds
4. Check DevTools Console for `[Realtime] subscribed to schedule_data` message

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
- **Supabase** — PostgreSQL database, real-time subscriptions, authentication
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
- **Storage**: Supabase PostgreSQL (with real-time sync) + browser localStorage (for UI preferences)
- **Authentication**: Email magic links (invite-only)
- **Real-time**: WebSocket subscriptions for instant multi-user updates
- **Migrations**: Automatic migration when loading data from Supabase or imported files

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
