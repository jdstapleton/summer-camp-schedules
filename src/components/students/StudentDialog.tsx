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
import { randomSafetyCode } from '@/services/dataMigrations';

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
  const [safetyCode, setSafetyCode] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [backupName, setBackupName] = useState('');
  const [backupPhone, setBackupPhone] = useState('');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstName(student?.firstName ?? '');
      setLastName(student?.lastName ?? '');
      setGender(student?.gender ?? 'male');
      setSafetyCode(student?.safetyCode ?? randomSafetyCode());
      setEmergencyName(student?.emergency?.name ?? '');
      setEmergencyPhone(student?.emergency?.phone ?? '');
      setBackupName(student?.backup?.name ?? '');
      setBackupPhone(student?.backup?.phone ?? '');
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
      emergency: {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
      },
      backup: {
        name: backupName.trim(),
        phone: backupPhone.trim(),
      },
    });
  };

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    safetyCode.length === 4 &&
    emergencyName.trim().length > 0 &&
    emergencyPhone.trim().length > 0 &&
    backupName.trim().length > 0 &&
    backupPhone.trim().length > 0;

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
                      onClick={() => setSafetyCode(randomSafetyCode())}
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
        <TextField
          label="Emergency Contact Name"
          value={emergencyName}
          onChange={(e) => setEmergencyName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Emergency Phone"
          value={emergencyPhone}
          onChange={(e) => setEmergencyPhone(e.target.value)}
          fullWidth
          margin="normal"
          required
          type="tel"
        />
        <TextField
          label="Backup Contact Name"
          value={backupName}
          onChange={(e) => setBackupName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Backup Phone"
          value={backupPhone}
          onChange={(e) => setBackupPhone(e.target.value)}
          fullWidth
          margin="normal"
          required
          type="tel"
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
