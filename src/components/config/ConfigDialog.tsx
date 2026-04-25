import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tab,
  Tabs,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAppConfig } from '@/contexts/AppConfigProvider';
import type { ImportColumnConfig } from '@/models/types';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ConfigDialog({ open, onClose }: ConfigDialogProps) {
  const { config, updateConfig } = useAppConfig();
  const [tab, setTab] = useState(0);
  const [gradeRanges, setGradeRanges] = useState<string[]>([]);
  const [newGradeRange, setNewGradeRange] = useState('');
  const [extraWeeks, setExtraWeeks] = useState<string[]>([]);
  const [newWeek, setNewWeek] = useState('');
  const [defaultMaxSize, setDefaultMaxSize] = useState('10');
  const [importColumnConfig, setImportColumnConfig] = useState<ImportColumnConfig | null>(null);
  const [editingColumnField, setEditingColumnField] = useState<keyof ImportColumnConfig | null>(null);
  const [newColumnHeader, setNewColumnHeader] = useState('');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradeRanges([...config.gradeRanges]);
      setExtraWeeks([...config.extraWeeks]);
      setDefaultMaxSize(String(config.defaultMaxSize));
      setImportColumnConfig(JSON.parse(JSON.stringify(config.importColumnConfig)));
      setNewGradeRange('');
      setNewWeek('');
      setNewColumnHeader('');
      setEditingColumnField(null);
      setTab(0);
    }
  }, [open, config]);

  const addGradeRange = () => {
    const trimmed = newGradeRange.trim();
    if (trimmed && !gradeRanges.includes(trimmed)) {
      setGradeRanges([...gradeRanges, trimmed]);
      setNewGradeRange('');
    }
  };

  const removeGradeRange = (index: number) => {
    setGradeRanges(gradeRanges.filter((_, i) => i !== index));
  };

  const addWeek = () => {
    const trimmed = newWeek.trim();
    if (trimmed && !extraWeeks.includes(trimmed)) {
      setExtraWeeks([...extraWeeks, trimmed]);
      setNewWeek('');
    }
  };

  const removeWeek = (index: number) => {
    setExtraWeeks(extraWeeks.filter((_, i) => i !== index));
  };

  const addColumnHeader = (field: keyof ImportColumnConfig) => {
    if (!importColumnConfig || !newColumnHeader.trim()) return;
    const trimmed = newColumnHeader.trim();
    if (!importColumnConfig[field].includes(trimmed)) {
      setImportColumnConfig({
        ...importColumnConfig,
        [field]: [...importColumnConfig[field], trimmed],
      });
      setNewColumnHeader('');
    }
  };

  const removeColumnHeader = (field: keyof ImportColumnConfig, index: number) => {
    if (!importColumnConfig) return;
    setImportColumnConfig({
      ...importColumnConfig,
      [field]: importColumnConfig[field].filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    const parsedMaxSize = parseInt(defaultMaxSize, 10);
    if (!isNaN(parsedMaxSize) && parsedMaxSize >= 1 && importColumnConfig) {
      updateConfig({
        gradeRanges,
        extraWeeks,
        defaultMaxSize: parsedMaxSize,
        importColumnConfig,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} sx={{ mb: 2 }}>
          <Tab label="Camp Defaults" />
          <Tab label="Import Columns" />
        </Tabs>

        {tab === 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Grade Ranges
            </Typography>
            <List dense>
              {gradeRanges.map((range, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeGradeRange(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  }
                >
                  <ListItemText primary={range} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="New Grade Range"
                value={newGradeRange}
                onChange={(e) => setNewGradeRange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGradeRange();
                  }
                }}
                placeholder="e.g. Grades 1-3"
                fullWidth
              />
              <Button
                onClick={addGradeRange}
                variant="outlined"
                disabled={!newGradeRange.trim() || gradeRanges.includes(newGradeRange.trim())}
              >
                Add
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Extra Default Weeks
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Auto-generated Mondays already appear in the Camp form autocomplete. Add specific
              dates here to always include them.
            </Typography>
            <List dense>
              {extraWeeks.map((week, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeWeek(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  }
                >
                  <ListItemText primary={week} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="New Week"
                value={newWeek}
                onChange={(e) => setNewWeek(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addWeek();
                  }
                }}
                placeholder="e.g. June 8"
                fullWidth
              />
              <Button
                onClick={addWeek}
                variant="outlined"
                disabled={!newWeek.trim() || extraWeeks.includes(newWeek.trim())}
              >
                Add
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Default Max Camp Size
            </Typography>
            <TextField
              label="Default Max Camp Size"
              value={defaultMaxSize}
              onChange={(e) => setDefaultMaxSize(e.target.value)}
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              fullWidth
              size="small"
              helperText="Default camp size when creating new camps. If enrollment exceeds this, multiple instances are created."
            />
          </>
        )}

        {tab === 1 && importColumnConfig && (
          <Box sx={{ pt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Configure column header mappings for Excel imports. Each field can match multiple column headers.
            </Typography>
            {Object.entries(importColumnConfig).map(([field, headers]) => (
              <Box
                key={field}
                sx={{
                  mb: 2.5,
                  p: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ textTransform: 'capitalize', fontWeight: 600, flex: 1 }}
                  >
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  {editingColumnField !== field && (
                    <IconButton
                      size="small"
                      onClick={() => setEditingColumnField(field as keyof ImportColumnConfig)}
                      title="Add column header"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {headers.map((header: string, idx: number) => (
                    <Chip
                      key={idx}
                      label={header}
                      onDelete={() =>
                        removeColumnHeader(field as keyof ImportColumnConfig, idx)
                      }
                      size="small"
                    />
                  ))}
                </Box>
                {editingColumnField === field && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      value={newColumnHeader}
                      onChange={(e) => setNewColumnHeader(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addColumnHeader(field as keyof ImportColumnConfig);
                        }
                      }}
                      placeholder="Add column header"
                      autoFocus
                      fullWidth
                    />
                    <Button
                      onClick={() =>
                        addColumnHeader(field as keyof ImportColumnConfig)
                      }
                      variant="outlined"
                      disabled={!newColumnHeader.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => setEditingColumnField(null)}
                      variant="text"
                    >
                      Done
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
