import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
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
import type { Student } from '@/models/types';
import { StudentDialog } from './StudentDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import {
  ActionButtonGroup,
  MutedTableCell,
} from './StudentsPage.styles';

function NoPhotoIcon({
  fontSize = 'small',
  isActive = false,
}: {
  fontSize?: 'small' | 'medium' | 'large',
  isActive?: boolean,
}) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <PhotoCameraIcon
        fontSize={fontSize}
        sx={{
          opacity: 0.25,
          color: isActive ? 'rgba(211, 47, 47, 0.25)' : 'rgba(0, 0, 0, 0.26)',
        }}
      />
      <NotInterestedIcon
        fontSize={fontSize}
        sx={{
          position: 'absolute',
          top: -4,
          right: -4,
          color: isActive ? '#d32f2f' : 'rgba(0, 0, 0, 0.26)',
        }}
      />
    </Box>
  );
}

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
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    name: '',
    camps: [] as string[],
    age: '',
    custody: [] as string[],
    tshirtSize: [] as string[],
  });
  const [showOnlyAllergies, setShowOnlyAllergies] = useState(false);
  const [filterNoPhoto, setFilterNoPhoto] = useState(false);
  const [filterPreCamp, setFilterPreCamp] = useState(false);
  const [filterPostCamp, setFilterPostCamp] = useState(false);
  const [filterMedical, setFilterMedical] = useState(false);
  const [filterSpecialRequest, setFilterSpecialRequest] = useState(false);

  const uniqueCamps = Array.from(
    new Set(
      data.camps.map((c) => c.name)
    )
  ).sort();

  const uniqueCustody = Array.from(
    new Set(data.students.map((s) => s.custody))
  ).sort();

  const uniqueTshirtSizes = Array.from(
    new Set(data.students.map((s) => s.tshirtSize))
  ).sort();

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

  const handleSort = (column: string) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const handleMultiSelectChange = (
    key: 'camps' | 'custody' | 'tshirtSize',
    value: string[]
  ) => {
    // If "All" (empty string) is selected, clear all selections
    if (value.includes('')) {
      setFilters({ ...filters, [key]: [] });
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const hasNutAllergy = (student: Student): boolean => {
    return (
      student.medicalIssues.toLowerCase().includes('nut') ||
      student.specialRequest.toLowerCase().includes('nut')
    );
  };

  const hasAllergy = (student: Student): boolean => {
    return (
      student.medicalIssues.toLowerCase().includes('allerg') ||
      student.specialRequest.toLowerCase().includes('allerg') ||
      hasNutAllergy(student)
    );
  };

  const compareValues = (a: unknown, b: unknown): number => {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return 0;
  };

  const getSortedStudents = () => {
    const filtered = [...data.students].filter((student) => {
      if (filters.name) {
        const fullName = `${student.lastName}, ${student.firstName}`.toLowerCase();
        if (!fullName.includes(filters.name.toLowerCase())) return false;
      }
      if (filters.camps.length > 0) {
        const studentCamps = data.registrations
          .filter((reg) => reg.studentIds.includes(student.id))
          .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
          .filter(Boolean);
        if (!filters.camps.some((camp) => studentCamps.includes(camp))) return false;
      }
      if (filters.age) {
        if (student.age.toString() !== filters.age) return false;
      }
      if (filters.custody.length > 0) {
        if (!filters.custody.includes(student.custody)) return false;
      }
      if (filters.tshirtSize.length > 0) {
        if (!filters.tshirtSize.includes(student.tshirtSize)) return false;
      }
      if (showOnlyAllergies) {
        if (!hasAllergy(student)) return false;
      }
      if (filterMedical) {
        if (!student.medicalIssues) return false;
      }
      if (filterSpecialRequest) {
        if (!student.specialRequest) return false;
      }
      if (filterNoPhoto) {
        if (student.photo) return false;
      }
      if (filterPreCamp) {
        if (!student.preCamp) return false;
      }
      if (filterPostCamp) {
        if (!student.postCamp) return false;
      }
      return true;
    });

    const sorted = filtered.sort((a, b) => {
      let aVal: unknown;
      let bVal: unknown;

      switch (orderBy) {
        case 'name':
          aVal = `${a.lastName}, ${a.firstName}`;
          bVal = `${b.lastName}, ${b.firstName}`;
          break;
        case 'camps':
          aVal = data.registrations
            .filter((reg) => reg.studentIds.includes(a.id))
            .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
            .filter(Boolean)
            .join(', ');
          bVal = data.registrations
            .filter((reg) => reg.studentIds.includes(b.id))
            .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
            .filter(Boolean)
            .join(', ');
          break;
        case 'age':
          aVal = a.age;
          bVal = b.age;
          break;
        case 'custody':
          aVal = a.custody;
          bVal = b.custody;
          break;
        case 'tshirtSize':
          aVal = a.tshirtSize;
          bVal = b.tshirtSize;
          break;
        default:
          return 0;
      }

      const comparison = compareValues(aVal, bVal);
      return order === 'asc' ? comparison : -comparison;
    });
    return sorted;
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
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell colSpan={7} sx={{ p: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showOnlyAllergies}
                      onChange={(e) => setShowOnlyAllergies(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show only students with allergies"
                  sx={{ m: 0 }}
                />
              </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ p: 0.5, width: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filter name..."
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
                />
              </TableCell>
              <TableCell sx={{ p: 0.5, width: 0 }}>
                <Select
                  multiple
                  fullWidth
                  size="small"
                  value={filters.camps}
                  onChange={(e) => handleMultiSelectChange('camps', e.target.value as string[])}
                  displayEmpty
                  renderValue={(selected) =>
                    selected.length === 0 ? 'All Camps' : `${selected.length} selected`
                  }
                  slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
                >
                  <MenuItem value="">All Camps</MenuItem>
                  {uniqueCamps.map((camp) => (
                    <MenuItem key={camp} value={camp}>
                      {camp}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ p: 0.5, width: 0 }} align="right">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filter age..."
                  value={filters.age}
                  onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                  slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
                />
              </TableCell>
              <TableCell sx={{ p: 0.5, width: 0 }}>
                <Select
                  multiple
                  fullWidth
                  size="small"
                  value={filters.custody}
                  onChange={(e) => handleMultiSelectChange('custody', e.target.value as string[])}
                  displayEmpty
                  renderValue={(selected) =>
                    selected.length === 0 ? 'All Custody' : `${selected.length} selected`
                  }
                  slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
                >
                  <MenuItem value="">All Custody</MenuItem>
                  {uniqueCustody.map((custody) => (
                    <MenuItem key={custody} value={custody}>
                      {custody}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ p: 0.5, width: 0 }}>
                <Select
                  multiple
                  fullWidth
                  size="small"
                  value={filters.tshirtSize}
                  onChange={(e) => handleMultiSelectChange('tshirtSize', e.target.value as string[])}
                  displayEmpty
                  renderValue={(selected) =>
                    selected.length === 0 ? 'All Sizes' : `${selected.length} selected`
                  }
                  slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
                >
                  <MenuItem value="">All Sizes</MenuItem>
                  {uniqueTshirtSizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ p: 0.5, width: 0 }} align="center">
                <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                  <Tooltip title={filterNoPhoto ? 'Show all' : 'Show without photo'}>
                    <IconButton
                      size="small"
                      onClick={() => setFilterNoPhoto(!filterNoPhoto)}
                      sx={{
                        padding: '4px',
                      }}
                    >
                      <NoPhotoIcon fontSize="small" isActive={filterNoPhoto} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={filterPreCamp ? 'Show all' : 'Show with pre-camp'}>
                    <IconButton
                      size="small"
                      onClick={() => setFilterPreCamp(!filterPreCamp)}
                      sx={{
                        color: filterPreCamp ? 'warning.main' : 'action.disabled',
                      }}
                    >
                      <WbSunnyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={filterPostCamp ? 'Show all' : 'Show with post-camp'}>
                    <IconButton
                      size="small"
                      onClick={() => setFilterPostCamp(!filterPostCamp)}
                      sx={{
                        color: filterPostCamp ? 'info.main' : 'action.disabled',
                      }}
                    >
                      <NightsStayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={filterMedical ? 'Show all' : 'Show with medical issues'}>
                    <IconButton
                      size="small"
                      onClick={() => setFilterMedical(!filterMedical)}
                      sx={{
                        color: filterMedical ? 'error.main' : 'action.disabled',
                      }}
                    >
                      <LocalHospitalIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={filterSpecialRequest ? 'Show all' : 'Show with special requests'}>
                    <IconButton
                      size="small"
                      onClick={() => setFilterSpecialRequest(!filterSpecialRequest)}
                      sx={{
                        color: filterSpecialRequest ? 'action.main' : 'action.disabled',
                      }}
                    >
                      <NoteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ p: 0.5, width: 0 }} align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedStudents().map((student) => {
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
