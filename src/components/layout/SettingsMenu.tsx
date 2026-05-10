import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from '@tanstack/react-router';
import { useLocation } from '@/contexts/LocationContext';
import { ConfigDialog } from '@/components/config/ConfigDialog';
import { supabase } from '@/services/supabaseClient';

export function SettingsMenu() {
  const { location, locations, createLocation, deleteLocation } = useLocation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const menuOpen = Boolean(anchorEl);
  const [configOpen, setConfigOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSwitchLocation = (urlTag: string) => {
    setAnchorEl(null);
    navigate({ to: `/${urlTag}` });
  };

  const handleOpenAdd = () => {
    setAnchorEl(null);
    setNewName('');
    setNewAddress('');
    setAddOpen(true);
  };

  const handleCreateLocation = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await createLocation(newName.trim(), newAddress.trim());
      setAddOpen(false);
      navigate({ to: `/${created.urlTag}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setAnchorEl(null);
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const isCurrentLocation = deleteTarget.id === location.id;
    await deleteLocation(deleteTarget.id);
    setDeleteTarget(null);
    if (isCurrentLocation) {
      const remaining = locations.filter((l) => l.id !== deleteTarget.id);
      if (remaining.length > 0) {
        navigate({ to: `/${remaining[0].urlTag}` });
      }
    }
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} title="Settings" sx={{ display: { xs: 'none', md: 'block' } }}>
        <SettingsIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}>
        <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', display: 'block' }}>
          Location
        </Typography>
        {locations.map((loc) => (
          <MenuItem key={loc.id} onClick={() => handleSwitchLocation(loc.urlTag)} selected={loc.id === location.id}>
            <ListItemIcon sx={{ minWidth: 32 }}>{loc.id === location.id ? <CheckIcon fontSize="small" /> : null}</ListItemIcon>
            <ListItemText primary={loc.name} secondary={loc.address || undefined} />
            <IconButton
              size="small"
              edge="end"
              disabled={locations.length <= 1}
              onClick={(e) => handleDeleteClick(e, loc.id, loc.name)}
              title={`Delete ${loc.name}`}
              sx={{ ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
        <MenuItem onClick={handleOpenAdd}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add Location" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setConfigOpen(true);
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Add Location dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Location</DialogTitle>
        <DialogContent>
          <TextField
            label="Location Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoFocus
            placeholder="e.g. North Campus"
          />
          <TextField label="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} fullWidth margin="normal" placeholder="e.g. 123 Main St" />
          {newName.trim() && (
            <Typography variant="caption" color="text.secondary">
              URL tag:{' '}
              {newName
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateLocation} disabled={!newName.trim() || saving}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Location</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? All schedule data for this location will be permanently removed.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ConfigDialog open={configOpen} onClose={() => setConfigOpen(false)} />
    </>
  );
}
