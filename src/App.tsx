import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { AppConfigProvider } from '@/contexts/AppConfigProvider';
import { ScheduleProvider } from '@/contexts/ScheduleProvider';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { StudentsPage } from '@/components/students/StudentsPage';
import { CampsPage } from '@/components/camps/CampsPage';
import { RegistrationsPage } from '@/components/registrations/RegistrationsPage';
import { SchedulePage } from '@/components/schedule/SchedulePage';

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/students',
  component: StudentsPage,
});

const campsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/camps',
  component: CampsPage,
});

const registrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registrations',
  component: RegistrationsPage,
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  component: SchedulePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  studentsRoute,
  campsRoute,
  registrationsRoute,
  scheduleRoute,
]);

const router = createRouter({ routeTree });

export function App() {
  return (
    <AppConfigProvider>
      <ScheduleProvider>
        <RouterProvider router={router} />
      </ScheduleProvider>
    </AppConfigProvider>
  );
}
