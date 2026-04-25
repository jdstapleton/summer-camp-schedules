import { useState } from 'react';
import {
  Box,
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NoteIcon from '@mui/icons-material/Note';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useSchedule } from '@/hooks/useSchedule';
import type { Student } from '@/models/types';
import { studentSortCompare } from '@/services/exports/shared';
import { StudentDialog } from './StudentDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import {
  ActionButtonGroup,
  CapitalizedTableCell,
  MutedTableCell,
} from './StudentsPage.styles';

export function StudentsPage() {
  const {
    data,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
              <TableCell>Custody</TableCell>
              <TableCell>T-Shirt Size</TableCell>
              <TableCell align="center">Photo</TableCell>
              <TableCell align="center">Pre/Post</TableCell>
              <TableCell align="center">Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...data.students].sort(studentSortCompare).map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  {student.lastName}, {student.firstName}
                </TableCell>
                <CapitalizedTableCell>{student.gender}</CapitalizedTableCell>
                <TableCell align="right">{student.age}</TableCell>
                <TableCell>{student.custody}</TableCell>
                <TableCell>{student.tshirtSize}</TableCell>
                <TableCell align="center">
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <PhotoCameraIcon fontSize="small" color="action" sx={student.photo ? { opacity: 0.25  } : undefined} />
                    {!student.photo && (
                      <NotInterestedIcon
                        fontSize="small"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {student.preCamp && (
                      <Tooltip title="Pre-Camp">
                        <WbSunnyIcon fontSize="small" />
                      </Tooltip>
                    )}
                    {student.postCamp && (
                      <Tooltip title="Post-Camp">
                        <NightsStayIcon fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
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
                <MutedTableCell colSpan={9} align="center">
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
    </div>
  );
}
