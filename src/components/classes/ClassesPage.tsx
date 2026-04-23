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
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { Camp } from '@/models/types';
import { CampDialog } from './ClassTypeDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

dayjs.extend(customParseFormat);

export function ClassesPage() {
  const { data, addCamp, updateCamp, deleteCamp } =
    useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingCamp(null);
    setDialogOpen(true);
  };

  const handleEdit = (camp: Camp) => {
    setEditingCamp(camp);
    setDialogOpen(true);
  };

  const handleSave = (campData: Omit<Camp, 'id'>) => {
    if (editingCamp) {
      updateCamp({ ...campData, id: editingCamp.id });
    } else {
      addCamp(campData);
    }
    setDialogOpen(false);
  };

  const getEnrollmentCount = (campId: string) =>
    data.registrations.find((r) => r.campId === campId)?.studentIds
      .length ?? 0;

  const groupedByWeek = data.camps.reduce<Record<string, Camp[]>>((acc, camp) => {
    if (!acc[camp.week]) acc[camp.week] = [];
    acc[camp.week].push(camp);
    return acc;
  }, {});

  const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => {
    const dateA = dayjs(a, ['MMMM D', 'MMM D']);
    const dateB = dayjs(b, ['MMMM D', 'MMM D']);
    return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
  });

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
          Camps ({data.camps.length})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Camp
        </Button>
      </Box>

      {data.camps.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No camps added yet.
        </Typography>
      )}

      {sortedWeeks.map((week) => (
        <Box key={week} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {week}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Camp Name</TableCell>
                  <TableCell>Grade Range</TableCell>
                  <TableCell>Max Size</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Instances Needed</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedByWeek[week].map((camp) => {
                  const enrolled = getEnrollmentCount(camp.id);
                  const instances =
                    enrolled > 0 ? Math.ceil(enrolled / camp.maxSize) : 0;
                  return (
                    <TableRow key={camp.id}>
                      <TableCell>{camp.name}</TableCell>
                      <TableCell>{camp.gradeRange}</TableCell>
                      <TableCell>{camp.maxSize}</TableCell>
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
                        <IconButton size="small" onClick={() => handleEdit(camp)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeletingId(camp.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      <CampDialog
        open={dialogOpen}
        camp={editingCamp}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Camp"
        message="Are you sure? All enrollment data for this camp will also be deleted."
        onConfirm={() => {
          if (deletingId) deleteCamp(deletingId);
        }}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
