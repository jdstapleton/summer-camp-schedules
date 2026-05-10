import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/hooks/useSchedule';
import type { Camp } from '@/models/types';
import { CampDialog } from './CampDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CampsDesktopPage } from './CampsDesktopPage';
import { CampsMobilePage } from './CampsMobilePage';

dayjs.extend(customParseFormat);

export function CampsPage() {
  const { data, addCamp, updateCamp, deleteCamp } = useSchedule();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  const getEnrollmentCount = (campId: string) => data.registrations.find((r) => r.campId === campId)?.studentIds.length ?? 0;

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

  const sharedProps = {
    camps: data.camps,
    groupedByWeek,
    sortedWeeks,
    getEnrollmentCount,
    onAdd: handleAdd,
    onEdit: handleEdit,
    onStartDelete: (id: string) => setDeletingId(id),
  };

  return (
    <>
      {isMobile ? <CampsMobilePage {...sharedProps} /> : <CampsDesktopPage {...sharedProps} />}
      <CampDialog open={dialogOpen} camp={editingCamp} existingCamps={data.camps} onSave={handleSave} onClose={() => setDialogOpen(false)} />
      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Camp"
        message="Are you sure? All enrollment data for this camp will also be deleted."
        onConfirm={() => {
          if (deletingId) deleteCamp(deletingId);
        }}
        onClose={() => setDeletingId(null)}
      />
    </>
  );
}
