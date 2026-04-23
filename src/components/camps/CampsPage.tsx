import { useState } from 'react';
import {
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
import { useSchedule } from '@/hooks/useSchedule';
import type { Camp } from '@/models/types';
import { CampDialog } from './CampDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import { MutedBody2, WeekHeading, WeekSection } from './CampsPage.styles';

dayjs.extend(customParseFormat);

export function CampsPage() {
  const { data, addCamp, updateCamp, deleteCamp } = useSchedule();
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
    data.registrations.find((r) => r.campId === campId)?.studentIds.length ?? 0;

  const groupedByWeek = data.camps.reduce<Record<string, Camp[]>>(
    (acc, camp) => {
      if (!acc[camp.week]) acc[camp.week] = [];
      acc[camp.week].push(camp);
      return acc;
    },
    {}
  );

  const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => {
    const dateA = dayjs(a, ['MMMM D', 'MMM D']);
    const dateB = dayjs(b, ['MMMM D', 'MMM D']);
    return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
  });

  return (
    <div>
      <PageHeaderRow mb={2}>
        <Typography variant="h4">Camps ({data.camps.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Camp
        </Button>
      </PageHeaderRow>
      {data.camps.length === 0 && (
        <MutedBody2 variant="body2">No camps added yet.</MutedBody2>
      )}
      {sortedWeeks.map((week) => (
        <WeekSection key={week}>
          <WeekHeading variant="h6">{week}</WeekHeading>
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
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(camp)}
                        >
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
        </WeekSection>
      ))}
      <CampDialog
        open={dialogOpen}
        camp={editingCamp}
        existingCamps={data.camps}
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
    </div>
  );
}
