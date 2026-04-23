import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
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
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { Camp } from '@/models/types';
import { EnrollmentDialog } from './EnrollmentDialog';

dayjs.extend(customParseFormat);

type SortKey =
  | 'name'
  | 'gradeRange'
  | 'week'
  | 'maxSize'
  | 'enrolled'
  | 'instances'
  | 'friendGroups';

type SortDirection = 'asc' | 'desc';

export function RegistrationsPage() {
  const { data, updateRegistration } = useSchedule();
  const [managingCamp, setManagingCamp] = useState<Camp | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [sortBy, setSortBy] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: 'week', direction: 'asc' });

  const getRegistration = (campId: string) =>
    data.registrations.find((r) => r.campId === campId) ?? {
      campId,
      studentIds: [],
      friendGroups: [],
    };

  const activeRegistration = managingCamp
    ? getRegistration(managingCamp.id)
    : null;

  const uniqueWeeks = Array.from(new Set(data.camps.map((c) => c.week))).sort(
    (a, b) => {
      const dateA = dayjs(a, ['MMMM D', 'MMM D']);
      const dateB = dayjs(b, ['MMMM D', 'MMM D']);
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
    }
  );

  const rows = data.camps
    .filter((c) => !selectedWeek || c.week === selectedWeek)
    .map((camp) => {
      const reg = getRegistration(camp.id);
      const enrolled = reg.studentIds.length;
      const instances = enrolled > 0 ? Math.ceil(enrolled / camp.maxSize) : 0;
      return {
        camp,
        reg,
        enrolled,
        instances,
        friendGroups: reg.friendGroups.length,
      };
    });

  const dir = sortBy.direction === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    let cmp = 0;
    switch (sortBy.key) {
      case 'name':
        cmp = a.camp.name.localeCompare(b.camp.name);
        break;
      case 'gradeRange':
        cmp = a.camp.gradeRange.localeCompare(b.camp.gradeRange);
        break;
      case 'week': {
        const dateA = dayjs(a.camp.week, ['MMMM D', 'MMM D']);
        const dateB = dayjs(b.camp.week, ['MMMM D', 'MMM D']);
        cmp = dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
        break;
      }
      case 'maxSize':
        cmp = a.camp.maxSize - b.camp.maxSize;
        break;
      case 'enrolled':
        cmp = a.enrolled - b.enrolled;
        break;
      case 'instances':
        cmp = a.instances - b.instances;
        break;
      case 'friendGroups':
        cmp = a.friendGroups - b.friendGroups;
        break;
    }
    return cmp * dir;
  });

  const handleSort = (key: SortKey) => {
    setSortBy((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const sortHeader = (key: SortKey, label: string) => (
    <TableSortLabel
      active={sortBy.key === key}
      direction={sortBy.key === key ? sortBy.direction : 'asc'}
      onClick={() => handleSort(key)}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Registrations
          </Typography>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            Assign students to camps and define friend groups to keep together.
          </Typography>
        </Box>
        {uniqueWeeks.length > 0 && (
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Week</InputLabel>
            <Select
              value={selectedWeek}
              label="Week"
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <MenuItem value="">All Weeks</MenuItem>
              {uniqueWeeks.map((week) => (
                <MenuItem key={week} value={week}>
                  {week}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{sortHeader('name', 'Camp')}</TableCell>
              <TableCell>{sortHeader('gradeRange', 'Grade Range')}</TableCell>
              <TableCell>{sortHeader('week', 'Week')}</TableCell>
              <TableCell>{sortHeader('maxSize', 'Max Size')}</TableCell>
              <TableCell>{sortHeader('enrolled', 'Enrolled')}</TableCell>
              <TableCell>{sortHeader('instances', 'Instances')}</TableCell>
              <TableCell>
                {sortHeader('friendGroups', 'Friend Groups')}
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ camp, reg, enrolled, instances }) => (
              <TableRow key={camp.id}>
                <TableCell>{camp.name}</TableCell>
                <TableCell>{camp.gradeRange}</TableCell>
                <TableCell>{camp.week}</TableCell>
                <TableCell>{camp.maxSize}</TableCell>
                <TableCell>{enrolled}</TableCell>
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
                    <Typography variant="body2" sx={{
                      color: "text.secondary"
                    }}>
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
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ color: 'text.secondary' }}
                >
                  {data.camps.length === 0
                    ? 'No camps defined. Add camps on the Camps page first.'
                    : 'No camps match the selected week.'}
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
