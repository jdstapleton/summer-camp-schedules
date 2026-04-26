import { useState } from 'react';
import { Box, Button, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface CampDefaultsTabProps {
  gradeRanges: string[];
  onAddGradeRange: (value: string) => void;
  onRemoveGradeRange: (index: number) => void;
  extraWeeks: string[];
  onAddWeek: (value: string) => void;
  onRemoveWeek: (index: number) => void;
  defaultMaxSize: string;
  onDefaultMaxSizeChange: (value: string) => void;
}

export function CampDefaultsTab({
  gradeRanges,
  onAddGradeRange,
  onRemoveGradeRange,
  extraWeeks,
  onAddWeek,
  onRemoveWeek,
  defaultMaxSize,
  onDefaultMaxSizeChange,
}: CampDefaultsTabProps) {
  const [newGradeRange, setNewGradeRange] = useState('');
  const [newWeek, setNewWeek] = useState('');

  function handleAddGradeRange() {
    onAddGradeRange(newGradeRange);
    setNewGradeRange('');
  }

  function handleAddWeek() {
    onAddWeek(newWeek);
    setNewWeek('');
  }

  return (
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
                <IconButton edge="end" size="small" onClick={() => onRemoveGradeRange(index)}>
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddGradeRange();
            }
          }}
          placeholder="e.g. Grades 1-3"
          fullWidth
        />
        <Button onClick={handleAddGradeRange} variant="outlined" disabled={!newGradeRange.trim() || gradeRanges.includes(newGradeRange.trim())}>
          Add
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Extra Default Weeks
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Auto-generated Mondays already appear in the Camp form autocomplete. Add specific dates here to always include them.
      </Typography>
      <List dense>
        {extraWeeks.map((week, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <ListItemSecondaryAction>
                <IconButton edge="end" size="small" onClick={() => onRemoveWeek(index)}>
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddWeek();
            }
          }}
          placeholder="e.g. June 8"
          fullWidth
        />
        <Button onClick={handleAddWeek} variant="outlined" disabled={!newWeek.trim() || extraWeeks.includes(newWeek.trim())}>
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
        onChange={(e) => onDefaultMaxSizeChange(e.target.value)}
        type="number"
        slotProps={{ htmlInput: { min: 1 } }}
        fullWidth
        size="small"
        helperText="Default camp size when creating new camps. If enrollment exceeds this, multiple instances are created."
      />
    </>
  );
}
