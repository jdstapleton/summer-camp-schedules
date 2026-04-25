import { Button, IconButton, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { useSchedule } from '@/hooks/useSchedule';
import { useStudentsFilters } from '@/contexts/StudentsFiltersContext';
import type { Student } from '@/models/types';
import { StudentDialog } from './StudentDialog';
import { StudentsFilterRow } from './StudentsFilterRow';
import { StudentFlags } from './StudentFlags';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import {
  ActionButtonGroup,
  MutedTableCell,
  StyledTable,
  NameCellContent,
  FlagsCellContent,
  FlagsCellWrapper,
  NameColumnCell,
  CampsColumnCell,
  AgeColumnCell,
  CustodyColumnCell,
  TshirtSizeColumnCell,
  FlagsColumnCell,
  ActionsColumnCell,
} from './StudentsDesktopPage.styles';

interface StudentsDesktopPageProps {
  onEdit: (student: Student) => void;
  onAdd: () => void;
  dialogOpen: boolean;
  editingStudent: Student | null;
  onSave: (studentData: Omit<Student, 'id'>) => void;
  onCloseDialog: () => void;
  deletingId: string | null;
  onStartDelete: (id: string) => void;
  onDelete: (id: string) => void;
  onClosedDeleteDialog: () => void;
}

export function StudentsDesktopPage({
  onEdit,
  onAdd,
  dialogOpen,
  editingStudent,
  onSave,
  onCloseDialog,
  deletingId,
  onStartDelete,
  onDelete,
  onClosedDeleteDialog,
}: StudentsDesktopPageProps) {
  const { data } = useSchedule();
  const { sortedStudents, orderBy, order, handleSort } = useStudentsFilters();

  return (
    <div>
      <PageHeaderRow mb={2}>
        <Typography variant="h4">Students ({data.students.length})</Typography>
        <ActionButtonGroup>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            Add Student
          </Button>
        </ActionButtonGroup>
      </PageHeaderRow>

      <TableContainer component={Paper}>
        <StyledTable>
          <TableHead>
            <TableRow>
              <NameColumnCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleSort('name')}>
                  Name
                </TableSortLabel>
              </NameColumnCell>
              <CampsColumnCell sortDirection={orderBy === 'camps' ? order : false}>
                <TableSortLabel active={orderBy === 'camps'} direction={order} onClick={() => handleSort('camps')}>
                  Camps
                </TableSortLabel>
              </CampsColumnCell>
              <AgeColumnCell align="right" sortDirection={orderBy === 'age' ? order : false}>
                <TableSortLabel active={orderBy === 'age'} direction={order} onClick={() => handleSort('age')}>
                  Age
                </TableSortLabel>
              </AgeColumnCell>
              <CustodyColumnCell sortDirection={orderBy === 'custody' ? order : false}>
                <TableSortLabel active={orderBy === 'custody'} direction={order} onClick={() => handleSort('custody')}>
                  Custody
                </TableSortLabel>
              </CustodyColumnCell>
              <TshirtSizeColumnCell sortDirection={orderBy === 'tshirtSize' ? order : false}>
                <TableSortLabel active={orderBy === 'tshirtSize'} direction={order} onClick={() => handleSort('tshirtSize')}>
                  T-Shirt Size
                </TableSortLabel>
              </TshirtSizeColumnCell>
              <FlagsColumnCell align="center">Flags</FlagsColumnCell>
              <ActionsColumnCell align="right">Actions</ActionsColumnCell>
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
                    <NameCellContent>
                      <span>
                        {student.lastName}, {student.firstName}
                      </span>
                      {student.gender === 'male' && <MaleIcon fontSize="small" color="action" />}
                      {student.gender === 'female' && <FemaleIcon fontSize="small" color="action" />}
                    </NameCellContent>
                  </TableCell>
                  <TableCell>{studentCamps}</TableCell>
                  <TableCell align="right">{student.age}</TableCell>
                  <TableCell>{student.custody}</TableCell>
                  <TableCell>{student.tshirtSize}</TableCell>
                  <FlagsCellWrapper align="center">
                    <FlagsCellContent>
                      <StudentFlags student={student} />
                    </FlagsCellContent>
                  </FlagsCellWrapper>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onEdit(student)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onStartDelete(student.id)}>
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
        </StyledTable>
      </TableContainer>

      <StudentDialog open={dialogOpen} student={editingStudent} onSave={onSave} onClose={onCloseDialog} />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Student"
        message="Are you sure? This student will be removed from all class registrations."
        onConfirm={() => {
          if (deletingId) onDelete(deletingId);
        }}
        onClose={onClosedDeleteDialog}
      />
    </div>
  );
}
