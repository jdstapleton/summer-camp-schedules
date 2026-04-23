import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { ClassType } from '@/models/types';

interface ClassTypeDialogProps {
  open: boolean;
  classType: ClassType | null;
  onSave: (data: Omit<ClassType, 'id'>) => void;
  onClose: () => void;
}

export function ClassTypeDialog({
  open,
  classType,
  onSave,
  onClose,
}: ClassTypeDialogProps) {
  const [name, setName] = useState('');
  const [maxSize, setMaxSize] = useState('16');

  useEffect(() => {
    if (open) {
      setName(classType?.name ?? '');
      setMaxSize(String(classType?.maxSize ?? 16));
    }
  }, [open, classType]);

  const parsedMax = parseInt(maxSize, 10);
  const isValid =
    name.trim().length > 0 && !isNaN(parsedMax) && parsedMax >= 1;

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({ name: name.trim(), maxSize: parsedMax });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {classType ? 'Edit Class Type' : 'Add Class Type'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Class Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
          autoFocus
          placeholder="e.g. Minecraft Programming"
        />
        <TextField
          label="Max Class Size"
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
          {classType ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
