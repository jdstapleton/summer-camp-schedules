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
  TableSortLabel,
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
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { useSchedule } from '@/hooks/useSchedule';
import { useStudentsFilters } from '@/contexts/StudentsFiltersContext';
import { StudentsFiltersProvider } from '@/contexts/StudentsFiltersProvider';
import type { Student } from '@/models/types';
import { StudentDialog } from './StudentDialog';
import { StudentsFilterRow } from './StudentsFilterRow';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import {
  ActionButtonGroup,
  MutedTableCell,
} from './StudentsPage.styles';

export function StudentsPage() {
  const { data } = useSchedule();
  return (
    <StudentsFiltersProvider data={data}>
      <StudentsPageContent />
    </StudentsFiltersProvider>
  );
}

function StudentsPageContent() {
  const { data, addStudent, updateStudent, deleteStudent } = useSchedule();
  const { sortedStudents, orderBy, order, handleSort } = useStudentsFilters();

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
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '25%' }} sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={order}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '18%' }} sortDirection={orderBy === 'camps' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'camps'}
                  direction={order}
                  onClick={() => handleSort('camps')}
                >
                  Camps
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '8%' }} align="right" sortDirection={orderBy === 'age' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'age'}
                  direction={order}
                  onClick={() => handleSort('age')}
                >
                  Age
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '13%' }} sortDirection={orderBy === 'custody' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'custody'}
                  direction={order}
                  onClick={() => handleSort('custody')}
                >
                  Custody
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '13%' }} sortDirection={orderBy === 'tshirtSize' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'tshirtSize'}
                  direction={order}
                  onClick={() => handleSort('tshirtSize')}
                >
                  T-Shirt Size
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '13%' }} align="center">Flags</TableCell>
              <TableCell sx={{ width: '10%' }} align="right">Actions</TableCell>
            </TableRow>
            <StudentsFilterRow />
          </TableHead>
          <TableBody>
            {sortedStudents.map((student: Student) => {
              const studentCamps = data.registrations
                .filter((reg) => reg.studentIds.includes(student.id))
                .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
                .filter(Boolean)
                .join(', ');

              return (
              <TableRow key={student.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{student.lastName}, {student.firstName}</span>
                    {student.gender === 'male' && (
                      <Tooltip title="Male">
                        <MaleIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                    {student.gender === 'female' && (
                      <Tooltip title="Female">
                        <FemaleIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{studentCamps}</TableCell>
                <TableCell align="right">{student.age}</TableCell>
                <TableCell>{student.custody}</TableCell>
                <TableCell>{student.tshirtSize}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <PhotoCameraIcon fontSize="small" color="action" sx={student.photo ? { opacity: 0.25 } : undefined} />
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
                    {student.preCamp ? (
                      <Tooltip title="Pre-Camp">
                        <WbSunnyIcon fontSize="small" />
                      </Tooltip>
                    ) : (
                      <Box sx={{ width: '1.25rem' }} />
                    )}
                    {student.postCamp ? (
                      <Tooltip title="Post-Camp">
                        <NightsStayIcon fontSize="small" />
                      </Tooltip>
                    ) : (
                      <Box sx={{ width: '1.25rem' }} />
                    )}
                    {student.medicalIssues ? (
                      <Tooltip title={student.medicalIssues}>
                        <LocalHospitalIcon fontSize="small" color="error" />
                      </Tooltip>
                    ) : (
                      <Box sx={{ width: '1.25rem' }} />
                    )}
                    {student.specialRequest ? (
                      <Tooltip title={student.specialRequest}>
                        <NoteIcon fontSize="small" color="action" />
                      </Tooltip>
                    ) : (
                      <Box sx={{ width: '1.25rem' }} />
                    )}
                  </Box>
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
            );
            })}
            {data.students.length === 0 && (
              <TableRow>
                <MutedTableCell colSpan={7} align="center">
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
