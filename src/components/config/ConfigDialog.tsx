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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppConfig } from '@/contexts/AppConfigProvider';

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

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradeRanges([...config.gradeRanges]);
      setExtraWeeks([...config.extraWeeks]);
      setNewGradeRange('');
      setNewWeek('');
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

  const handleSave = () => {
    updateConfig({ gradeRanges, extraWeeks });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} sx={{ mb: 2 }}>
          <Tab label="Camp Defaults" />
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
          </>
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
