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
import type { ClassType } from '@/models/types';
import { EnrollmentDialog } from './EnrollmentDialog';

export function RegistrationsPage() {
  const { data, updateRegistration } = useSchedule();
  const [managingClass, setManagingClass] = useState<ClassType | null>(null);

  const getRegistration = (classTypeId: string) =>
    data.registrations.find((r) => r.classTypeId === classTypeId) ?? {
      classTypeId,
      studentIds: [],
      friendGroups: [],
    };

  const activeRegistration = managingClass
    ? getRegistration(managingClass.id)
    : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registrations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Assign students to classes and define friend groups to keep together.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Max Size</TableCell>
              <TableCell>Enrolled</TableCell>
              <TableCell>Instances</TableCell>
              <TableCell>Friend Groups</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.classTypes.map((ct) => {
              const reg = getRegistration(ct.id);
              const instances =
                reg.studentIds.length > 0
                  ? Math.ceil(reg.studentIds.length / ct.maxSize)
                  : 0;
              return (
                <TableRow key={ct.id}>
                  <TableCell>{ct.name}</TableCell>
                  <TableCell>{ct.maxSize}</TableCell>
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
                    <Button size="small" onClick={() => setManagingClass(ct)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {data.classTypes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ color: 'text.secondary' }}
                >
                  No class types defined. Add class types on the Classes page
                  first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {managingClass && activeRegistration && (
        <EnrollmentDialog
          open={true}
          classType={managingClass}
          registration={activeRegistration}
          students={data.students}
          onSave={(reg) => {
            updateRegistration(reg);
            setManagingClass(null);
          }}
          onClose={() => setManagingClass(null)}
        />
      )}
    </Box>
  );
}
