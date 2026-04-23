import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { StudentsPage } from '@/components/students/StudentsPage';
import { ClassesPage } from '@/components/classes/ClassesPage';
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

const classesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classes',
  component: ClassesPage,
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
  classesRoute,
  registrationsRoute,
  scheduleRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <ScheduleProvider>
      <RouterProvider router={router} />
    </ScheduleProvider>
  );
}
