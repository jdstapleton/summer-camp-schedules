import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { Camp } from '@/models/types';

interface CampDialogProps {
  open: boolean;
  camp: Camp | null;
  existingCamps: Camp[];
  onSave: (data: Omit<Camp, 'id'>) => void;
  onClose: () => void;
}

export function CampDialog({
  open,
  camp,
  existingCamps,
  onSave,
  onClose,
}: CampDialogProps) {
  const [name, setName] = useState('');
  const [gradeRange, setGradeRange] = useState('');
  const [week, setWeek] = useState('');
  const [maxSize, setMaxSize] = useState('16');

  const existingNames = Array.from(
    new Set(existingCamps.map((c) => c.name))
  ).sort();
  const existingWeeks = Array.from(
    new Set(existingCamps.map((c) => c.week))
  ).sort();
  const existingGradeRanges = Array.from(
    new Set(existingCamps.map((c) => c.gradeRange))
  ).sort();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(camp?.name ?? '');
      setGradeRange(camp?.gradeRange ?? '');
      setWeek(camp?.week ?? '');
      setMaxSize(String(camp?.maxSize ?? 16));
    }
  }, [open, camp]);

  const parsedMax = parseInt(maxSize, 10);
  const isValid =
    name.trim().length > 0 &&
    gradeRange.trim().length > 0 &&
    week.trim().length > 0 &&
    !isNaN(parsedMax) &&
    parsedMax >= 1;

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      name: name.trim(),
      gradeRange: gradeRange.trim(),
      week: week.trim(),
      maxSize: parsedMax,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{camp ? 'Edit Camp' : 'Add Camp'}</DialogTitle>
      <DialogContent>
        <Autocomplete
          freeSolo
          options={existingNames}
          value={name}
          onChange={(_, newValue) => setName(newValue ?? '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Camp Name"
              margin="normal"
              required
              autoFocus
              placeholder="e.g. Minecraft Programming"
            />
          )}
          fullWidth
        />
        <Autocomplete
          freeSolo
          options={existingGradeRanges}
          value={gradeRange}
          onChange={(_, newValue) => setGradeRange(newValue ?? '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Grade Range"
              margin="normal"
              required
              placeholder="e.g. Grades 4-7, PreK-K"
            />
          )}
          fullWidth
        />
        <Autocomplete
          freeSolo
          options={existingWeeks}
          value={week}
          onChange={(_, newValue) => setWeek(newValue ?? '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Week"
              margin="normal"
              required
              placeholder="e.g. June 8, June 15"
            />
          )}
          fullWidth
        />
        <TextField
          label="Max Camp Size"
          value={maxSize}
          onChange={(e) => setMaxSize(e.target.value)}
          fullWidth
          margin="normal"
          required
          type="number"
          slotProps={{ htmlInput: { min: 1 } }}
          helperText="If enrollment exceeds this, multiple instances will be created."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid}>
          {camp ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
