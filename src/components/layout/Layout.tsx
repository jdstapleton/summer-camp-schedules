import { useState } from 'react';
import { AppBar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Link, Outlet } from '@tanstack/react-router';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppShell>
      <AppBar position="static">
        <Toolbar>
          <BrandTypography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/logo.webp" alt="" sx={{ height: 32, mr: 1 }} />
          </BrandTypography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {NAV_LINKS.map((link) => (
              <Button key={link.to} component={Link} to={link.to} color="inherit">
                {link.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={() => setConfigOpen(true)} title="Settings" sx={{ display: { xs: 'none', md: 'block' } }}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ display: { xs: 'block', md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 250 }}>
          {NAV_LINKS.map((link) => (
            <ListItemButton key={link.to} component={Link} to={link.to} onClick={() => setDrawerOpen(false)}>
              {link.label}
            </ListItemButton>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItemButton
            onClick={() => {
              setConfigOpen(true);
              setDrawerOpen(false);
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </List>
      </Drawer>
      <PageContainer maxWidth="lg">
        <Outlet />
      </PageContainer>
      <ConfigDialog open={configOpen} onClose={() => setConfigOpen(false)} />
    </AppShell>
  );
}
