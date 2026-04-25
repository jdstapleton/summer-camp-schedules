import { useEffect, useReducer } from 'react';
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

interface StudentFormState {
  firstName: string;
  lastName: string;
  gender: Gender;
  age: string;
  custody: Custody;
  photo: boolean;
  preCamp: boolean;
  postCamp: boolean;
  specialRequest: string;
  medicalIssues: string;
  tshirtSize: string;
  primaryName: string;
  primaryHomePhone: string;
  primaryCellPhone: string;
  secondaryName: string;
  secondaryHomePhone: string;
  secondaryCellPhone: string;
  emergencyName: string;
  emergencyHomePhone: string;
  emergencyCellPhone: string;
}

type StudentFormAction =
  | { type: 'reset'; student: Student | null }
  | { type: 'patch'; payload: Partial<StudentFormState> };

const defaultState: StudentFormState = {
  firstName: '',
  lastName: '',
  gender: 'male',
  age: '',
  custody: 'Both',
  photo: false,
  preCamp: false,
  postCamp: false,
  specialRequest: '',
  medicalIssues: '',
  tshirtSize: '',
  primaryName: '',
  primaryHomePhone: '',
  primaryCellPhone: '',
  secondaryName: '',
  secondaryHomePhone: '',
  secondaryCellPhone: '',
  emergencyName: '',
  emergencyHomePhone: '',
  emergencyCellPhone: '',
};

function studentFormReducer(
  state: StudentFormState,
  action: StudentFormAction
): StudentFormState {
  switch (action.type) {
    case 'reset':
      return {
        firstName: action.student?.firstName ?? '',
        lastName: action.student?.lastName ?? '',
        gender: action.student?.gender ?? 'male',
        age: action.student?.age != null ? String(action.student.age) : '',
        custody: action.student?.custody ?? 'Both',
        photo: action.student?.photo ?? false,
        preCamp: action.student?.preCamp ?? false,
        postCamp: action.student?.postCamp ?? false,
        specialRequest: action.student?.specialRequest ?? '',
        medicalIssues: action.student?.medicalIssues ?? '',
        tshirtSize: action.student?.tshirtSize ?? '',
        primaryName: action.student?.primary?.name ?? '',
        primaryHomePhone: action.student?.primary?.homePhone ?? '',
        primaryCellPhone: action.student?.primary?.cellPhone ?? '',
        secondaryName: action.student?.secondary?.name ?? '',
        secondaryHomePhone: action.student?.secondary?.homePhone ?? '',
        secondaryCellPhone: action.student?.secondary?.cellPhone ?? '',
        emergencyName: action.student?.emergency?.name ?? '',
        emergencyHomePhone: action.student?.emergency?.homePhone ?? '',
        emergencyCellPhone: action.student?.emergency?.cellPhone ?? '',
      };
    case 'patch':
      return { ...state, ...action.payload };
  }
}

export function StudentDialog({
  open,
  student,
  onSave,
  onClose,
}: StudentDialogProps) {
  const [form, dispatch] = useReducer(studentFormReducer, defaultState);

  useEffect(() => {
    if (open) {
      dispatch({ type: 'reset', student });
    }
  }, [open, student]);

  const handleGenderChange = (e: SelectChangeEvent) =>
    dispatch({ type: 'patch', payload: { gender: e.target.value as Gender } });

  const handleCustodyChange = (e: SelectChangeEvent) =>
    dispatch({
      type: 'patch',
      payload: { custody: e.target.value as Custody },
    });

  const handleAgeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 2);
    dispatch({ type: 'patch', payload: { age: digits } });
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      age: parseInt(form.age, 10),
      custody: form.custody,
      photo: form.photo,
      preCamp: form.preCamp,
      postCamp: form.postCamp,
      specialRequest: form.specialRequest.trim(),
      medicalIssues: form.medicalIssues.trim(),
      tshirtSize: form.tshirtSize.trim(),
      primary: {
        name: form.primaryName.trim(),
        homePhone: form.primaryHomePhone.trim(),
        cellPhone: form.primaryCellPhone.trim(),
      },
      secondary: {
        name: form.secondaryName.trim(),
        homePhone: form.secondaryHomePhone.trim(),
        cellPhone: form.secondaryCellPhone.trim(),
      },
      emergency: {
        name: form.emergencyName.trim(),
        homePhone: form.emergencyHomePhone.trim(),
        cellPhone: form.emergencyCellPhone.trim(),
      },
    });
  };

  const isValid =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.age.length > 0 &&
    form.primaryName.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
      <DialogContent>
        <TextField
          label="First Name"
          value={form.firstName}
          onChange={(e) =>
            dispatch({ type: 'patch', payload: { firstName: e.target.value } })
          }
          fullWidth
          margin="normal"
          required
          autoFocus
        />
        <TextField
          label="Last Name"
          value={form.lastName}
          onChange={(e) =>
            dispatch({ type: 'patch', payload: { lastName: e.target.value } })
          }
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Age"
          value={form.age}
          onChange={(e) => handleAgeChange(e.target.value)}
          fullWidth
          margin="normal"
          required
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 2,
            },
          }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select
            value={form.gender}
            label="Gender"
            onChange={handleGenderChange}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Custody</InputLabel>
          <Select
            value={form.custody}
            label="Custody"
            onChange={handleCustodyChange}
          >
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
          value={form.primaryName}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { primaryName: e.target.value },
            })
          }
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Home Phone"
          value={form.primaryHomePhone}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { primaryHomePhone: e.target.value },
            })
          }
          fullWidth
          margin="normal"
          type="tel"
        />
        <TextField
          label="Cell Phone"
          value={form.primaryCellPhone}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { primaryCellPhone: e.target.value },
            })
          }
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
          value={form.secondaryName}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { secondaryName: e.target.value },
            })
          }
          fullWidth
          margin="normal"
        />
        <TextField
          label="Home Phone"
          value={form.secondaryHomePhone}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { secondaryHomePhone: e.target.value },
            })
          }
          fullWidth
          margin="normal"
          type="tel"
        />
        <TextField
          label="Cell Phone"
          value={form.secondaryCellPhone}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { secondaryCellPhone: e.target.value },
            })
          }
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
          value={form.emergencyName}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { emergencyName: e.target.value },
            })
          }
          fullWidth
          margin="normal"
        />
        <TextField
          label="Home Phone"
          value={form.emergencyHomePhone}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { emergencyHomePhone: e.target.value },
            })
          }
          fullWidth
          margin="normal"
          type="tel"
        />
        <TextField
          label="Cell Phone"
          value={form.emergencyCellPhone}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { emergencyCellPhone: e.target.value },
            })
          }
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
          value={form.medicalIssues}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { medicalIssues: e.target.value },
            })
          }
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <TextField
          label="Special Request"
          value={form.specialRequest}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { specialRequest: e.target.value },
            })
          }
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <TextField
          label="T-Shirt Size"
          value={form.tshirtSize}
          onChange={(e) =>
            dispatch({
              type: 'patch',
              payload: { tshirtSize: e.target.value },
            })
          }
          fullWidth
          margin="normal"
          placeholder="e.g., Youth Medium, Large, XL"
        />

        <Divider sx={{ mt: 2, mb: 1 }} />
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Extended Care &amp; Options</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.photo}
                  onChange={(e) =>
                    dispatch({
                      type: 'patch',
                      payload: { photo: e.target.checked },
                    })
                  }
                />
              }
              label="Photo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.preCamp}
                  onChange={(e) =>
                    dispatch({
                      type: 'patch',
                      payload: { preCamp: e.target.checked },
                    })
                  }
                />
              }
              label="Pre-Camp"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.postCamp}
                  onChange={(e) =>
                    dispatch({
                      type: 'patch',
                      payload: { postCamp: e.target.checked },
                    })
                  }
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
