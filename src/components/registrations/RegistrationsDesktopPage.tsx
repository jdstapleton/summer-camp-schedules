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
import type { Camp, CampRegistration } from '@/models/types';

type SortKey = 'name' | 'gradeRange' | 'week' | 'maxSize' | 'enrolled' | 'instances' | 'friendGroups';
type SortDirection = 'asc' | 'desc';

interface RegistrationRow {
  camp: Camp;
  reg: CampRegistration;
  enrolled: number;
  instances: number;
  friendGroups: number;
}

interface RegistrationsDesktopPageProps {
  rows: RegistrationRow[];
  uniqueWeeks: string[];
  selectedWeek: string;
  onWeekChange: (week: string) => void;
  sortBy: { key: SortKey; direction: SortDirection };
  onSort: (key: SortKey) => void;
  onManage: (camp: Camp) => void;
}

export function RegistrationsDesktopPage({ rows, uniqueWeeks, selectedWeek, onWeekChange, sortBy, onSort, onManage }: RegistrationsDesktopPageProps) {
  const sortHeader = (key: SortKey, label: string) => (
    <TableSortLabel active={sortBy.key === key} direction={sortBy.key === key ? sortBy.direction : 'asc'} onClick={() => onSort(key)}>
      {label}
    </TableSortLabel>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Registrations
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Assign students to camps and define friend groups to keep together.
          </Typography>
        </Box>
        {uniqueWeeks.length > 0 && (
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Week</InputLabel>
            <Select value={selectedWeek} label="Week" onChange={(e) => onWeekChange(e.target.value)}>
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
              <TableCell>{sortHeader('friendGroups', 'Friend Groups')}</TableCell>
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
                    <Chip label={`${instances} instances`} size="small" color="warning" />
                  ) : instances === 1 ? (
                    <Chip label="1 instance" size="small" color="success" />
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{reg.friendGroups.length > 0 ? `${reg.friendGroups.length} group${reg.friendGroups.length > 1 ? 's' : ''}` : '—'}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => onManage(camp)}>
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>
                  No camps match the selected week.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
