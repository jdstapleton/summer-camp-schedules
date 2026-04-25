import { useState } from 'react';
import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import { Link, Outlet } from '@tanstack/react-router';
import SettingsIcon from '@mui/icons-material/Settings';
import { ConfigDialog } from '@/components/config/ConfigDialog';
import { AppShell, BrandTypography, PageContainer } from './Layout.styles';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/camps', label: 'Camps' },
  { to: '/registrations', label: 'Registrations' },
  { to: '/schedule', label: 'Schedule' },
] as const;

export function Layout() {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <AppShell>
      <AppBar position="static">
        <Toolbar>
          <BrandTypography
            variant="h6"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box
              component="img"
              src="/logo.webp"
              alt=""
              sx={{ height: 32, mr: 1 }}
            />
          </BrandTypography>
          {NAV_LINKS.map((link) => (
            <Button key={link.to} component={Link} to={link.to} color="inherit">
              {link.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            onClick={() => setConfigOpen(true)}
            title="Settings"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <PageContainer maxWidth="lg">
        <Outlet />
      </PageContainer>
      <ConfigDialog open={configOpen} onClose={() => setConfigOpen(false)} />
    </AppShell>
  );
}
