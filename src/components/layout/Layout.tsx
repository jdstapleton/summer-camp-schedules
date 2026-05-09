import { useState } from 'react';
import { AppBar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Link, Outlet, useNavigate, useParams } from '@tanstack/react-router';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { ConfigDialog } from '@/components/config/ConfigDialog';
import { useLocation } from '@/contexts/LocationContext';
import { SettingsMenu } from './SettingsMenu';
import { AppShell, BrandTypography, PageContainer } from './Layout.styles';

export function Layout() {
  const { locationTag } = useParams({ strict: false });
  const tag = locationTag ?? '';
  const { location, locations } = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const navLinks = [
    { to: `/${tag}`, label: 'Dashboard' },
    { to: `/${tag}/students`, label: 'Students' },
    { to: `/${tag}/camps`, label: 'Camps' },
    { to: `/${tag}/registrations`, label: 'Registrations' },
    { to: `/${tag}/schedule`, label: 'Schedule' },
  ];

  return (
    <AppShell>
      <AppBar position="static">
        <Toolbar>
          <BrandTypography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/logo.webp" alt="" sx={{ height: 32, mr: 1 }} />
          </BrandTypography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navLinks.map((link) => (
              <Button key={link.to} component={Link} to={link.to} color="inherit">
                {link.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <SettingsMenu />
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ display: { xs: 'block', md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 250 }}>
          {navLinks.map((link) => (
            <ListItemButton key={link.to} component={Link} to={link.to} onClick={() => setDrawerOpen(false)}>
              {link.label}
            </ListItemButton>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', display: 'block' }}>
            Location
          </Typography>
          {locations.map((loc) => (
            <ListItemButton
              key={loc.id}
              selected={loc.id === location.id}
              onClick={() => {
                setDrawerOpen(false);
                navigate({ to: `/${loc.urlTag}` });
              }}
            >
              <ListItemIcon>{loc.id === location.id ? <CheckIcon fontSize="small" /> : null}</ListItemIcon>
              <ListItemText primary={loc.name} secondary={loc.address || undefined} />
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
