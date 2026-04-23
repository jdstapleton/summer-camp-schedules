import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { Camp } from '@/models/types';
import { EnrollmentDialog } from './EnrollmentDialog';

export function RegistrationsPage() {
  const { data, updateRegistration } = useSchedule();
  const [managingCamp, setManagingCamp] = useState<Camp | null>(null);

  const getRegistration = (campId: string) =>
    data.registrations.find((r) => r.campId === campId) ?? {
      campId,
      studentIds: [],
      friendGroups: [],
    };

  const activeRegistration = managingCamp
    ? getRegistration(managingCamp.id)
    : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registrations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Assign students to camps and define friend groups to keep together.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Camp</TableCell>
              <TableCell>Grade Range</TableCell>
              <TableCell>Week</TableCell>
              <TableCell>Max Size</TableCell>
              <TableCell>Enrolled</TableCell>
              <TableCell>Instances</TableCell>
              <TableCell>Friend Groups</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.camps.map((camp) => {
              const reg = getRegistration(camp.id);
              const instances =
                reg.studentIds.length > 0
                  ? Math.ceil(reg.studentIds.length / camp.maxSize)
                  : 0;
              return (
                <TableRow key={camp.id}>
                  <TableCell>{camp.name}</TableCell>
                  <TableCell>{camp.gradeRange}</TableCell>
                  <TableCell>{camp.week}</TableCell>
                  <TableCell>{camp.maxSize}</TableCell>
                  <TableCell>{reg.studentIds.length}</TableCell>
                  <TableCell>
                    {instances > 1 ? (
                      <Chip
                        label={`${instances} instances`}
                        size="small"
                        color="warning"
                      />
                    ) : instances === 1 ? (
                      <Chip label="1 instance" size="small" color="success" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {reg.friendGroups.length > 0
                      ? `${reg.friendGroups.length} group${reg.friendGroups.length > 1 ? 's' : ''}`
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setManagingCamp(camp)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {data.camps.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ color: 'text.secondary' }}
                >
                  No camps defined. Add camps on the Camps page first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {managingCamp && activeRegistration && (
        <EnrollmentDialog
          open={true}
          camp={managingCamp}
          registration={activeRegistration}
          students={data.students}
          onSave={(reg) => {
            updateRegistration(reg);
            setManagingCamp(null);
          }}
          onClose={() => setManagingCamp(null)}
        />
      )}
    </Box>
  );
}
