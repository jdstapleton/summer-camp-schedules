import { Box, Button, CardContent, Chip, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import type { Camp, CampRegistration } from '@/models/types';
import { RegistrationCard, CardHeader, CardInfoGrid } from './RegistrationsMobilePage.styles';

interface RegistrationRow {
  camp: Camp;
  reg: CampRegistration;
  enrolled: number;
  instances: number;
  friendGroups: number;
}

interface RegistrationsMobilePageProps {
  rows: RegistrationRow[];
  uniqueWeeks: string[];
  selectedWeek: string;
  onWeekChange: (week: string) => void;
  onManage: (camp: Camp) => void;
}

export function RegistrationsMobilePage({ rows, uniqueWeeks, selectedWeek, onWeekChange, onManage }: RegistrationsMobilePageProps) {
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Registrations
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: uniqueWeeks.length > 0 ? 2 : 0 }}>
          Assign students to camps and define friend groups to keep together.
        </Typography>
        {uniqueWeeks.length > 0 && (
          <FormControl fullWidth size="small">
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
      {rows.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
          No camps match the selected week.
        </Typography>
      ) : (
        rows.map(({ camp, reg, enrolled, instances }) => (
          <RegistrationCard key={camp.id}>
            <CardContent>
              <CardHeader>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}>
                  {camp.name}
                </Typography>
                <Button size="small" onClick={() => onManage(camp)} sx={{ flexShrink: 0 }}>
                  Manage
                </Button>
              </CardHeader>
              <CardInfoGrid>
                <Typography variant="body2">
                  <strong>Grade:</strong> {camp.gradeRange}
                </Typography>
                <Typography variant="body2">
                  <strong>Week:</strong> {camp.week}
                </Typography>
                <Typography variant="body2">
                  <strong>Enrolled:</strong> {enrolled}/{camp.maxSize}
                </Typography>
                <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <strong>Instances:</strong>{' '}
                  {instances > 1 ? <Chip label={`${instances}`} size="small" color="warning" /> : instances === 1 ? <Chip label="1" size="small" color="success" /> : '—'}
                </Typography>
                {reg.friendGroups.length > 0 && (
                  <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                    <strong>Friend Groups:</strong> {reg.friendGroups.length} group{reg.friendGroups.length > 1 ? 's' : ''}
                  </Typography>
                )}
              </CardInfoGrid>
            </CardContent>
          </RegistrationCard>
        ))
      )}
    </Box>
  );
}
