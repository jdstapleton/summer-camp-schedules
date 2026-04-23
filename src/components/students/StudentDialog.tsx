import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import type { SelectChangeEvent } from '@mui/material';
import type { Gender, Student } from '@/models/types';

interface StudentDialogProps {
  open: boolean;
  student: Student | null;
  onSave: (data: Omit<Student, 'id'>) => void;
  onClose: () => void;
}

const generateSafetyCode = () =>
  Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

export function StudentDialog({
  open,
  student,
  onSave,
  onClose,
}: StudentDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [safetyCode, setSafetyCode] = useState('');

  useEffect(() => {
    if (open) {
      setFirstName(student?.firstName ?? '');
      setLastName(student?.lastName ?? '');
      setGender(student?.gender ?? 'male');
      setSafetyCode(student?.safetyCode ?? generateSafetyCode());
    }
  }, [open, student]);

  const handleGenderChange = (e: SelectChangeEvent) => {
    setGender(e.target.value as Gender);
  };

  const handleSafetyCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setSafetyCode(digitsOnly);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      safetyCode,
    });
  };

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    safetyCode.length === 4;

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
        <TextField
          label="Safety Code"
          value={safetyCode}
          onChange={(e) => handleSafetyCodeChange(e.target.value)}
          fullWidth
          margin="normal"
          required
          helperText="4-digit code used to verify student identity"
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 4,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Generate random code">
                    <IconButton
                      onClick={() => setSafetyCode(generateSafetyCode())}
                      edge="end"
                    >
                      <CasinoIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid}>
          {student ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
