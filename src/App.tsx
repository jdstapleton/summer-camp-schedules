import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { createRootRoute, createRoute, createRouter, Outlet, redirect, RouterProvider } from '@tanstack/react-router';
import { AppConfigProvider } from '@/contexts/AppConfigProvider';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { LocationLayout } from '@/components/layout/LocationLayout';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { StudentsPage } from '@/components/students/StudentsPage';
import { CampsPage } from '@/components/camps/CampsPage';
import { RegistrationsPage } from '@/components/registrations/RegistrationsPage';
import { SchedulePage } from '@/components/schedule/SchedulePage';
import { LoginPage } from '@/components/auth/LoginPage';
import { fetchLocations } from '@/services/supabaseStorage';
import { supabase } from '@/services/supabaseClient';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    const locations = await fetchLocations();
    const first = locations[0];
    throw redirect({ to: '/$locationTag', params: { locationTag: first?.urlTag ?? 'default' } });
  },
  component: () => null,
});

const locationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locationTag',
  component: LocationLayout,
});

const locationIndexRoute = createRoute({
  getParentRoute: () => locationRoute,
  path: '/',
  component: DashboardPage,
});

const studentsRoute = createRoute({
  getParentRoute: () => locationRoute,
  path: '/students',
  component: StudentsPage,
});

const campsRoute = createRoute({
  getParentRoute: () => locationRoute,
  path: '/camps',
  component: CampsPage,
});

const registrationsRoute = createRoute({
  getParentRoute: () => locationRoute,
  path: '/registrations',
  component: RegistrationsPage,
});

const scheduleRoute = createRoute({
  getParentRoute: () => locationRoute,
  path: '/schedule',
  component: SchedulePage,
});

const routeTree = rootRoute.addChildren([indexRoute, locationRoute.addChildren([locationIndexRoute, studentsRoute, campsRoute, registrationsRoute, scheduleRoute])]);

const router = createRouter({ routeTree });

function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(!!data.session && !error);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (session === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthGate>
        <AppConfigProvider>
          <RouterProvider router={router} />
        </AppConfigProvider>
      </AuthGate>
    </ErrorBoundary>
  );
}
