import { Button, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Camp } from '@/models/types';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import { MutedBody2, WeekHeading, WeekSection } from './CampsPage.styles';

interface CampsDesktopPageProps {
  camps: Camp[];
  groupedByWeek: Record<string, Camp[]>;
  sortedWeeks: string[];
  getEnrollmentCount: (campId: string) => number;
  onAdd: () => void;
  onEdit: (camp: Camp) => void;
  onStartDelete: (id: string) => void;
}

export function CampsDesktopPage({ camps, groupedByWeek, sortedWeeks, getEnrollmentCount, onAdd, onEdit, onStartDelete }: CampsDesktopPageProps) {
  return (
    <div>
      <PageHeaderRow mb={2}>
        <Typography variant="h4">Camps ({camps.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          Add Camp
        </Button>
      </PageHeaderRow>
      {camps.length === 0 && <MutedBody2 variant="body2">No camps added yet.</MutedBody2>}
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
                  const instances = enrolled > 0 ? Math.ceil(enrolled / camp.maxSize) : 0;
                  return (
                    <TableRow key={camp.id}>
                      <TableCell>{camp.name}</TableCell>
                      <TableCell>{camp.gradeRange}</TableCell>
                      <TableCell>{camp.maxSize}</TableCell>
                      <TableCell>{enrolled}</TableCell>
                      <TableCell>{instances > 0 ? <Chip label={instances} size="small" color={instances > 1 ? 'warning' : 'default'} /> : '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => onEdit(camp)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onStartDelete(camp.id)}>
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
    </div>
  );
}
