import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Gender, Student } from '@/models/types';

interface StudentDialogProps {
  open: boolean;
  student: Student | null;
  onSave: (data: Omit<Student, 'id'>) => void;
  onClose: () => void;
}

export function StudentDialog({
  open,
  student,
  onSave,
  onClose,
}: StudentDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  useEffect(() => {
    if (open) {
      setFirstName(student?.firstName ?? '');
      setLastName(student?.lastName ?? '');
      setGender(student?.gender ?? 'male');
    }
  }, [open, student]);

  const handleGenderChange = (e: SelectChangeEvent) => {
    setGender(e.target.value as Gender);
  };

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    onSave({ firstName: firstName.trim(), lastName: lastName.trim(), gender });
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
      <DialogContent>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
          required
          autoFocus
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select value={gender} label="Gender" onChange={handleGenderChange}>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid}
        >
          {student ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
