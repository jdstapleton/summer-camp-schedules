import { AppBar, Button, Toolbar } from '@mui/material';
import { Link, Outlet } from '@tanstack/react-router';
import { AppShell, BrandTypography, PageContainer } from './Layout.styles';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/camps', label: 'Camps' },
  { to: '/registrations', label: 'Registrations' },
  { to: '/schedule', label: 'Schedule' },
] as const;

export function Layout() {
  return (
    <AppShell>
      <AppBar position="static">
        <Toolbar>
          <BrandTypography variant="h6">
            ☀️ Summer Camp
          </BrandTypography>
          {NAV_LINKS.map((link) => (
            <Button key={link.to} component={Link} to={link.to} color="inherit">
              {link.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <PageContainer maxWidth="lg">
        <Outlet />
      </PageContainer>
    </AppShell>
  );
}
