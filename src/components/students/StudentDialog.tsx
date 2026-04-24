import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Custody, Gender, Student } from '@/models/types';

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
  const [age, setAge] = useState('');
  const [custody, setCustody] = useState<Custody>('Both');
  const [photo, setPhoto] = useState(false);
  const [preCamp, setPreCamp] = useState(false);
  const [postCamp, setPostCamp] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');
  const [medicalIssues, setMedicalIssues] = useState('');
  const [primaryName, setPrimaryName] = useState('');
  const [primaryHomePhone, setPrimaryHomePhone] = useState('');
  const [primaryCellPhone, setPrimaryCellPhone] = useState('');
  const [secondaryName, setSecondaryName] = useState('');
  const [secondaryHomePhone, setSecondaryHomePhone] = useState('');
  const [secondaryCellPhone, setSecondaryCellPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyHomePhone, setEmergencyHomePhone] = useState('');
  const [emergencyCellPhone, setEmergencyCellPhone] = useState('');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstName(student?.firstName ?? '');
      setLastName(student?.lastName ?? '');
      setGender(student?.gender ?? 'male');
      setAge(student?.age != null ? String(student.age) : '');
      setCustody(student?.custody ?? 'Both');
      setPhoto(student?.photo ?? false);
      setPreCamp(student?.preCamp ?? false);
      setPostCamp(student?.postCamp ?? false);
      setSpecialRequest(student?.specialRequest ?? '');
      setMedicalIssues(student?.medicalIssues ?? '');
      setPrimaryName(student?.primary?.name ?? '');
      setPrimaryHomePhone(student?.primary?.homePhone ?? '');
      setPrimaryCellPhone(student?.primary?.cellPhone ?? '');
      setSecondaryName(student?.secondary?.name ?? '');
      setSecondaryHomePhone(student?.secondary?.homePhone ?? '');
      setSecondaryCellPhone(student?.secondary?.cellPhone ?? '');
      setEmergencyName(student?.emergency?.name ?? '');
      setEmergencyHomePhone(student?.emergency?.homePhone ?? '');
      setEmergencyCellPhone(student?.emergency?.cellPhone ?? '');
    }
  }, [open, student]);

  const handleGenderChange = (e: SelectChangeEvent) =>
    setGender(e.target.value as Gender);

  const handleCustodyChange = (e: SelectChangeEvent) =>
    setCustody(e.target.value as Custody);

  const handleAgeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 2);
    setAge(digits);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      age: parseInt(age, 10),
      custody,
      photo,
      preCamp,
      postCamp,
      specialRequest: specialRequest.trim(),
      medicalIssues: medicalIssues.trim(),
      primary: {
        name: primaryName.trim(),
        homePhone: primaryHomePhone.trim(),
        cellPhone: primaryCellPhone.trim(),
      },
      secondary: {
        name: secondaryName.trim(),
        homePhone: secondaryHomePhone.trim(),
        cellPhone: secondaryCellPhone.trim(),
      },
      emergency: {
        name: emergencyName.trim(),
        homePhone: emergencyHomePhone.trim(),
        cellPhone: emergencyCellPhone.trim(),
      },
    });
  };

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    age.length > 0 &&
    primaryName.trim().length > 0;

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
        <TextField
          label="Age"
          value={age}
          onChange={(e) => handleAgeChange(e.target.value)}
          fullWidth
          margin="normal"
          required
          slotProps={{
            htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 2 },
          }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select value={gender} label="Gender" onChange={handleGenderChange}>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Custody</InputLabel>
          <Select value={custody} label="Custody" onChange={handleCustodyChange}>
            <MenuItem value="Both">Both</MenuItem>
            <MenuItem value="Father">Father</MenuItem>
            <MenuItem value="Mother">Mother</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ mt: 2, mb: 1 }} />
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Primary Contact
        </Typography>
        <TextField
          label="Name"
          value={primaryName}
          onChange={(e) => setPrimaryName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Home Phone"
          value={primaryHomePhone}
          onChange={(e) => setPrimaryHomePhone(e.target.value)}
          fullWidth
          margin="normal"
          type="tel"
        />
        <TextField
          label="Cell Phone"
          value={primaryCellPhone}
          onChange={(e) => setPrimaryCellPhone(e.target.value)}
          fullWidth
          margin="normal"
          type="tel"
        />

        <Divider sx={{ mt: 2, mb: 1 }} />
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Secondary Contact
        </Typography>
        <TextField
          label="Name"
          value={secondaryName}
          onChange={(e) => setSecondaryName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Home Phone"
          value={secondaryHomePhone}
          onChange={(e) => setSecondaryHomePhone(e.target.value)}
          fullWidth
          margin="normal"
          type="tel"
        />
        <TextField
          label="Cell Phone"
          value={secondaryCellPhone}
          onChange={(e) => setSecondaryCellPhone(e.target.value)}
          fullWidth
          margin="normal"
          type="tel"
        />

        <Divider sx={{ mt: 2, mb: 1 }} />
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Emergency Contact
        </Typography>
        <TextField
          label="Name"
          value={emergencyName}
          onChange={(e) => setEmergencyName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Home Phone"
          value={emergencyHomePhone}
          onChange={(e) => setEmergencyHomePhone(e.target.value)}
          fullWidth
          margin="normal"
          type="tel"
        />
        <TextField
          label="Cell Phone"
          value={emergencyCellPhone}
          onChange={(e) => setEmergencyCellPhone(e.target.value)}
          fullWidth
          margin="normal"
          type="tel"
        />

        <Divider sx={{ mt: 2, mb: 1 }} />
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Notes
        </Typography>
        <TextField
          label="Medical Issues"
          value={medicalIssues}
          onChange={(e) => setMedicalIssues(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <TextField
          label="Special Request"
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />

        <Divider sx={{ mt: 2, mb: 1 }} />
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Extended Care &amp; Options</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={photo}
                  onChange={(e) => setPhoto(e.target.checked)}
                />
              }
              label="Photo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={preCamp}
                  onChange={(e) => setPreCamp(e.target.checked)}
                />
              }
              label="Pre-Camp"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={postCamp}
                  onChange={(e) => setPostCamp(e.target.checked)}
                />
              }
              label="Post-Camp"
            />
          </FormGroup>
        </FormControl>
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
