import { useEffect, useState } from 'react';
import {
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
  onSave: (data: Omit<Camp, 'id'>) => void;
  onClose: () => void;
}

export function CampDialog({
  open,
  camp,
  onSave,
  onClose,
}: CampDialogProps) {
  const [name, setName] = useState('');
  const [gradeRange, setGradeRange] = useState('');
  const [week, setWeek] = useState('');
  const [maxSize, setMaxSize] = useState('16');

  useEffect(() => {
    if (open) {
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
      <DialogTitle>
        {camp ? 'Edit Camp' : 'Add Camp'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Camp Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
          autoFocus
          placeholder="e.g. Minecraft Programming"
        />
        <TextField
          label="Grade Range"
          value={gradeRange}
          onChange={(e) => setGradeRange(e.target.value)}
          fullWidth
          margin="normal"
          required
          placeholder="e.g. Grades 4-7, PreK-K"
        />
        <TextField
          label="Week"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          fullWidth
          margin="normal"
          required
          placeholder="e.g. June 8, June 15"
        />
        <TextField
          label="Max Camp Size"
          value={maxSize}
          onChange={(e) => setMaxSize(e.target.value)}
          fullWidth
          margin="normal"
          required
          type="number"
          inputProps={{ min: 1 }}
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
