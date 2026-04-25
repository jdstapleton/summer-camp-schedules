import { useState } from 'react';
import { Box, Button, CardContent, CardActions, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NoteIcon from '@mui/icons-material/Note';
import { useSchedule } from '@/hooks/useSchedule';
import { useStudentsFilters } from '@/contexts/StudentsFiltersContext';
import type { Student } from '@/models/types';
import { StudentDialog } from './StudentDialog';
import { StudentFlags } from './StudentFlags';
import { StudentsMobileFilters } from './StudentsMobileFilters';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import { StudentCard, CardHeader, CardNameSection, CardSecondaryInfo, CardFlagsRow, EmptyStateText, NoteRow } from './StudentsMobilePage.styles';

interface StudentsMobilePageProps {
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

interface ExpandableNoteProps {
  icon: React.ReactNode;
  text: string;
  iconColor?: string;
}

function ExpandableNote({ icon, text }: ExpandableNoteProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <NoteRow onClick={() => setExpanded(!expanded)}>
      {icon}
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          ...(!expanded && {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }),
        }}
      >
        {text}
      </Typography>
      <ExpandMoreIcon
        fontSize="small"
        sx={{
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          flexShrink: 0,
        }}
      />
    </NoteRow>
  );
}

export function StudentsMobilePage({
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
}: StudentsMobilePageProps) {
  const { data } = useSchedule();
  const { sortedStudents } = useStudentsFilters();

  return (
    <div>
      <PageHeaderRow mb={2}>
        <Typography variant="h4">Students ({data.students.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} size="small">
          Add
        </Button>
      </PageHeaderRow>

      <StudentsMobileFilters />

      {sortedStudents.length === 0 ? (
        <EmptyStateText>
          <Typography variant="body2">No students added yet.</Typography>
        </EmptyStateText>
      ) : (
        sortedStudents.map((student: Student) => {
          const studentCamps = data.registrations
            .filter((reg) => reg.studentIds.includes(student.id))
            .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
            .filter(Boolean)
            .join(', ');

          return (
            <StudentCard key={student.id}>
              <CardContent>
                <CardHeader>
                  <CardNameSection>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {student.lastName}, {student.firstName}
                    </Typography>
                    {student.gender === 'male' && <MaleIcon fontSize="small" color="action" />}
                    {student.gender === 'female' && <FemaleIcon fontSize="small" color="action" />}
                  </CardNameSection>
                  <CardActions>
                    <IconButton size="small" onClick={() => onEdit(student)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onStartDelete(student.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </CardHeader>

                {studentCamps && (
                  <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                    <strong>Camps:</strong> {studentCamps}
                  </Typography>
                )}

                <CardSecondaryInfo>
                  <Typography variant="body2">
                    <strong>Age:</strong> {student.age}
                  </Typography>
                  <Typography variant="body2">
                    <strong>T-Shirt:</strong> {student.tshirtSize}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Custody:</strong> {student.custody}
                  </Typography>
                </CardSecondaryInfo>

                {(student.medicalIssues || student.specialRequest) && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, marginTop: 1, paddingTop: 1, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                    {student.medicalIssues && <ExpandableNote icon={<LocalHospitalIcon fontSize="small" color="error" />} text={student.medicalIssues} />}
                    {student.specialRequest && <ExpandableNote icon={<NoteIcon fontSize="small" />} text={student.specialRequest} />}
                  </Box>
                )}

                <CardFlagsRow>
                  <StudentFlags student={student} gap={0.5} hideTextFlags />
                </CardFlagsRow>
              </CardContent>
            </StudentCard>
          );
        })
      )}

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
