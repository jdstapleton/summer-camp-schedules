import { useState } from 'react';
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NoteIcon from '@mui/icons-material/Note';
import { useSchedule } from '@/hooks/useSchedule';
import type { Student } from '@/models/types';
import { StudentDialog } from './StudentDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import {
  ActionButtonGroup,
  CapitalizedTableCell,
  MonospaceTableCell,
  MutedTableCell,
} from './StudentsPage.styles';

export function StudentsPage() {
  const {
    data,
    addStudent,
    updateStudent,
    deleteStudent,
    randomizeAllSafetyCodes,
  } = useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmRandomize, setConfirmRandomize] = useState(false);

  const handleAdd = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleSave = (studentData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      updateStudent({ ...studentData, id: editingStudent.id });
    } else {
      addStudent(studentData);
    }
    setDialogOpen(false);
  };

  return (
    <div>
      <PageHeaderRow mb={2}>
        <Typography variant="h4">Students ({data.students.length})</Typography>
        <ActionButtonGroup>
          <Tooltip title="Randomize Safety Codes">
            <span>
              <IconButton
                aria-label="Randomize Safety Codes"
                onClick={() => setConfirmRandomize(true)}
                disabled={data.students.length === 0}
              >
                <CasinoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Student
          </Button>
        </ActionButtonGroup>
      </PageHeaderRow>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell>Safety Code</TableCell>
              <TableCell>Custody</TableCell>
              <TableCell align="center">Photo</TableCell>
              <TableCell align="center">Pre-Camp</TableCell>
              <TableCell align="center">Post-Camp</TableCell>
              <TableCell align="center">Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  {student.firstName} {student.lastName}
                </TableCell>
                <CapitalizedTableCell>{student.gender}</CapitalizedTableCell>
                <TableCell align="right">{student.age}</TableCell>
                <MonospaceTableCell>{student.safetyCode}</MonospaceTableCell>
                <TableCell>{student.custody}</TableCell>
                <TableCell align="center">
                  {student.photo && <CheckIcon fontSize="small" />}
                </TableCell>
                <TableCell align="center">
                  {student.preCamp && <CheckIcon fontSize="small" />}
                </TableCell>
                <TableCell align="center">
                  {student.postCamp && <CheckIcon fontSize="small" />}
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  {student.medicalIssues && (
                    <Tooltip title={student.medicalIssues}>
                      <LocalHospitalIcon
                        fontSize="small"
                        color="error"
                        sx={{ mr: student.specialRequest ? 0.5 : 0 }}
                      />
                    </Tooltip>
                  )}
                  {student.specialRequest && (
                    <Tooltip title={student.specialRequest}>
                      <NoteIcon fontSize="small" color="action" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(student)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeletingId(student.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {data.students.length === 0 && (
              <TableRow>
                <MutedTableCell colSpan={10} align="center">
                  No students added yet.
                </MutedTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StudentDialog
        open={dialogOpen}
        student={editingStudent}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Student"
        message="Are you sure? This student will be removed from all class registrations."
        onConfirm={() => {
          if (deletingId) deleteStudent(deletingId);
        }}
        onClose={() => setDeletingId(null)}
      />

      <ConfirmDialog
        open={confirmRandomize}
        title="Randomize All Safety Codes"
        message={`This will generate new random 4-digit safety codes for all ${data.students.length} students, replacing their existing codes. This cannot be undone. Continue?`}
        confirmLabel="Randomize"
        onConfirm={randomizeAllSafetyCodes}
        onClose={() => setConfirmRandomize(false)}
      />
    </div>
  );
}
