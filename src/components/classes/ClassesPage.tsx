import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { ClassType } from '@/models/types';
import { ClassTypeDialog } from './ClassTypeDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function ClassesPage() {
  const { data, addClassType, updateClassType, deleteClassType } =
    useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingClass(null);
    setDialogOpen(true);
  };

  const handleEdit = (classType: ClassType) => {
    setEditingClass(classType);
    setDialogOpen(true);
  };

  const handleSave = (classTypeData: Omit<ClassType, 'id'>) => {
    if (editingClass) {
      updateClassType({ ...classTypeData, id: editingClass.id });
    } else {
      addClassType(classTypeData);
    }
    setDialogOpen(false);
  };

  const getEnrollmentCount = (classTypeId: string) =>
    data.registrations.find((r) => r.classTypeId === classTypeId)?.studentIds
      .length ?? 0;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">
          Class Types ({data.classTypes.length})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Class Type
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class Name</TableCell>
              <TableCell>Max Size</TableCell>
              <TableCell>Enrolled</TableCell>
              <TableCell>Instances Needed</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.classTypes.map((ct) => {
              const enrolled = getEnrollmentCount(ct.id);
              const instances =
                enrolled > 0 ? Math.ceil(enrolled / ct.maxSize) : 0;
              return (
                <TableRow key={ct.id}>
                  <TableCell>{ct.name}</TableCell>
                  <TableCell>{ct.maxSize}</TableCell>
                  <TableCell>{enrolled}</TableCell>
                  <TableCell>
                    {instances > 0 ? (
                      <Chip
                        label={instances}
                        size="small"
                        color={instances > 1 ? 'warning' : 'default'}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(ct)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeletingId(ct.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {data.classTypes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ color: 'text.secondary' }}
                >
                  No class types added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ClassTypeDialog
        open={dialogOpen}
        classType={editingClass}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Class Type"
        message="Are you sure? All enrollment data for this class will also be deleted."
        onConfirm={() => {
          if (deletingId) deleteClassType(deletingId);
        }}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
