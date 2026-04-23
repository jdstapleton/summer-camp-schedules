import { useEffect, useState } from 'react';
import {
  Autocomplete,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { CampRegistration, Camp, Student } from '@/models/types';

interface EnrollmentDialogProps {
  open: boolean;
  camp: Camp;
  registration: CampRegistration;
  students: Student[];
  onSave: (registration: CampRegistration) => void;
  onClose: () => void;
}

export function EnrollmentDialog({
  open,
  camp,
  registration,
  students,
  onSave,
  onClose,
}: EnrollmentDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [friendGroups, setFriendGroups] = useState<string[][]>([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupIds, setNewGroupIds] = useState<string[]>([]);
  const [autocompleteValue, setAutocompleteValue] = useState<Student | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedIds([...registration.studentIds]);
      setFriendGroups(registration.friendGroups.map((g) => [...g]));
      setAddingGroup(false);
      setNewGroupIds([]);
      setAutocompleteValue(null);
      setEditingStudentId(null);
    }
  }, [open, registration]);

  const addStudent = (student: Student) => {
    if (student && !selectedIds.includes(student.id)) {
      setSelectedIds((prev) => [...prev, student.id]);
      setAutocompleteValue(null);
    }
  };

  const removeStudent = (id: string) => {
    setSelectedIds((prev) => prev.filter((s) => s !== id));
    setFriendGroups((prev) =>
      prev
        .map((g) => g.filter((sid) => sid !== id))
        .filter((g) => g.length >= 2)
    );
  };

  const toggleNewGroupMember = (id: string) => {
    setNewGroupIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleStudentGroup = (studentId: string, groupIndex: number) => {
    setFriendGroups((prev) => {
      const newGroups = [...prev];
      const group = newGroups[groupIndex];
      if (group.includes(studentId)) {
        newGroups[groupIndex] = group.filter((id) => id !== studentId);
        if (newGroups[groupIndex].length < 2) {
          newGroups.splice(groupIndex, 1);
        }
      } else {
        newGroups[groupIndex] = [...group, studentId];
      }
      return newGroups;
    });
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
      campId: registration.campId,
      studentIds: selectedIds,
      friendGroups: validGroups,
    });
  };

  const inAGroup = new Set(friendGroups.flat());
  const enrolledStudents = students.filter((s) => selectedIds.includes(s.id));
  const availableForGroup = enrolledStudents.filter((s) => !inAGroup.has(s.id));

  const instancesNeeded =
    selectedIds.length > 0 ? Math.ceil(selectedIds.length / camp.maxSize) : 0;

  const studentName = (id: string) => {
    const s = students.find((st) => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Enrollment: {camp.name}
        <Typography variant="body2" color="text.secondary">
          Max size: {camp.maxSize} · Enrolled: {selectedIds.length}
          {instancesNeeded > 1 && ` · ${instancesNeeded} instances will be created`}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          Add Students
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={students.filter((s) => !selectedIds.includes(s.id))}
            getOptionLabel={(s) =>
              `${s.firstName} ${s.lastName} (${s.gender})`
            }
            value={autocompleteValue}
            onChange={(_, value) => {
              if (value) addStudent(value);
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Search and add student" />
            )}
            noOptionsText="All students already added"
          />
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Enrolled Students ({selectedIds.length})
        </Typography>
        {selectedIds.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {students.length === 0
              ? 'No students added yet. Go to the Students page first.'
              : 'Add students using the search box above.'}
          </Typography>
        )}
        {selectedIds.length > 0 && (
          <TableContainer sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Gender</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students
                  .filter((s) => selectedIds.includes(s.id))
                  .sort((a, b) =>
                    `${a.firstName} ${a.lastName}`.localeCompare(
                      `${b.firstName} ${b.lastName}`
                    )
                  )
                  .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{student.gender}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => setEditingStudentId(student.id)}
                          title="Edit friend groups"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => removeStudent(student.id)}
                          color="error"
                          title="Remove from class"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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

        {editingStudentId && (
          <Dialog open={true} onClose={() => setEditingStudentId(null)}>
            <DialogTitle>
              Edit Friend Groups for{' '}
              {students.find((s) => s.id === editingStudentId)?.firstName}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2, minWidth: 300 }}>
                {friendGroups.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No friend groups yet. Create one above.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {friendGroups.map((group, i) => (
                      <FormControlLabel
                        key={i}
                        control={
                          <Checkbox
                            checked={group.includes(editingStudentId)}
                            onChange={() =>
                              toggleStudentGroup(editingStudentId, i)
                            }
                          />
                        }
                        label={
                          <Typography variant="body2">
                            Group {i + 1}:{' '}
                            {group.map((id) => studentName(id)).join(', ')}
                          </Typography>
                        }
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingStudentId(null)}>Done</Button>
            </DialogActions>
          </Dialog>
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
