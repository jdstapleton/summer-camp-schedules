import { Button, CardContent, Chip, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Camp } from '@/models/types';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import { MutedBody2, WeekHeading, WeekSection } from './CampsPage.styles';
import { CampCard, CardHeader, CardNameSection, CardActions, CardInfoGrid } from './CampsMobilePage.styles';

interface CampsMobilePageProps {
  camps: Camp[];
  groupedByWeek: Record<string, Camp[]>;
  sortedWeeks: string[];
  getEnrollmentCount: (campId: string) => number;
  onAdd: () => void;
  onEdit: (camp: Camp) => void;
  onStartDelete: (id: string) => void;
}

export function CampsMobilePage({ camps, groupedByWeek, sortedWeeks, getEnrollmentCount, onAdd, onEdit, onStartDelete }: CampsMobilePageProps) {
  return (
    <div>
      <PageHeaderRow mb={2}>
        <Typography variant="h4">Camps ({camps.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} size="small">
          Add
        </Button>
      </PageHeaderRow>
      {camps.length === 0 && <MutedBody2 variant="body2">No camps added yet.</MutedBody2>}
      {sortedWeeks.map((week) => (
        <WeekSection key={week}>
          <WeekHeading variant="h6">{week}</WeekHeading>
          {groupedByWeek[week].map((camp) => {
            const enrolled = getEnrollmentCount(camp.id);
            const instances = enrolled > 0 ? Math.ceil(enrolled / camp.maxSize) : 0;
            return (
              <CampCard key={camp.id}>
                <CardContent>
                  <CardHeader>
                    <CardNameSection>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {camp.name}
                      </Typography>
                    </CardNameSection>
                    <CardActions>
                      <IconButton size="small" onClick={() => onEdit(camp)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onStartDelete(camp.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </CardHeader>
                  <CardInfoGrid>
                    <Typography variant="body2">
                      <strong>Grade:</strong> {camp.gradeRange}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Max:</strong> {camp.maxSize}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Enrolled:</strong> {enrolled}
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <strong>Instances:</strong> {instances > 0 ? <Chip label={instances} size="small" color={instances > 1 ? 'warning' : 'default'} /> : '—'}
                    </Typography>
                  </CardInfoGrid>
                </CardContent>
              </CampCard>
            );
          })}
        </WeekSection>
      ))}
    </div>
  );
}
