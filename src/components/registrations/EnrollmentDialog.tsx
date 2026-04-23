import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ClassRegistration, ClassType, Student } from '@/models/types';

interface EnrollmentDialogProps {
  open: boolean;
  classType: ClassType;
  registration: ClassRegistration;
  students: Student[];
  onSave: (registration: ClassRegistration) => void;
  onClose: () => void;
}

export function EnrollmentDialog({
  open,
  classType,
  registration,
  students,
  onSave,
  onClose,
}: EnrollmentDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [friendGroups, setFriendGroups] = useState<string[][]>([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupIds, setNewGroupIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedIds([...registration.studentIds]);
      setFriendGroups(registration.friendGroups.map((g) => [...g]));
      setAddingGroup(false);
      setNewGroupIds([]);
    }
  }, [open, registration]);

  const toggleEnroll = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleNewGroupMember = (id: string) => {
    setNewGroupIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const confirmAddGroup = () => {
    if (newGroupIds.length >= 2) {
      setFriendGroups((prev) => [...prev, newGroupIds]);
      setNewGroupIds([]);
      setAddingGroup(false);
    }
  };

  const removeGroup = (index: number) => {
    setFriendGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validGroups = friendGroups
      .map((g) => g.filter((id) => selectedIds.includes(id)))
      .filter((g) => g.length >= 2);
    onSave({
      classTypeId: registration.classTypeId,
      studentIds: selectedIds,
      friendGroups: validGroups,
    });
  };

  const inAGroup = new Set(friendGroups.flat());
  const enrolledStudents = students.filter((s) => selectedIds.includes(s.id));
  const availableForGroup = enrolledStudents.filter((s) => !inAGroup.has(s.id));

  const instancesNeeded =
    selectedIds.length > 0 ? Math.ceil(selectedIds.length / classType.maxSize) : 0;

  const studentName = (id: string) => {
    const s = students.find((st) => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Enrollment: {classType.name}
        <Typography variant="body2" color="text.secondary">
          Max size: {classType.maxSize} · Enrolled: {selectedIds.length}
          {instancesNeeded > 1 && ` · ${instancesNeeded} instances will be created`}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          Students
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            maxHeight: 240,
            overflowY: 'auto',
            mb: 2,
          }}
        >
          {students.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No students added yet. Go to the Students page first.
            </Typography>
          )}
          {students.map((student) => (
            <FormControlLabel
              key={student.id}
              control={
                <Checkbox
                  size="small"
                  checked={selectedIds.includes(student.id)}
                  onChange={() => toggleEnroll(student.id)}
                />
              }
              label={
                <Typography variant="body2">
                  {student.firstName} {student.lastName}{' '}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    ({student.gender})
                  </Typography>
                </Typography>
              }
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="subtitle2">
            Friend Groups ({friendGroups.length})
          </Typography>
          {!addingGroup && (
            <Button
              size="small"
              onClick={() => setAddingGroup(true)}
              disabled={availableForGroup.length < 2}
            >
              + Add Group
            </Button>
          )}
        </Box>

        {friendGroups.map((group, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Group {i + 1}:
            </Typography>
            {group.map((id) => (
              <Chip key={id} label={studentName(id)} size="small" />
            ))}
            <IconButton size="small" onClick={() => removeGroup(i)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        {friendGroups.length === 0 && !addingGroup && (
          <Typography variant="body2" color="text.secondary">
            No friend groups defined. Students in a group will be kept in the
            same instance.
          </Typography>
        )}

        {addingGroup && (
          <Box
            sx={{
              mt: 1,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" gutterBottom>
              Select 2 or more enrolled students to keep together:
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                maxHeight: 180,
                overflowY: 'auto',
              }}
            >
              {availableForGroup.map((student) => (
                <FormControlLabel
                  key={student.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={newGroupIds.includes(student.id)}
                      onChange={() => toggleNewGroupMember(student.id)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {student.firstName} {student.lastName}
                    </Typography>
                  }
                />
              ))}
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={confirmAddGroup}
                disabled={newGroupIds.length < 2}
              >
                Add Group
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setAddingGroup(false);
                  setNewGroupIds([]);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
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
