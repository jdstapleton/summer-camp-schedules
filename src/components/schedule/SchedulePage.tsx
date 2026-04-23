import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { CampInstance } from '@/models/types';

dayjs.extend(customParseFormat);

export function SchedulePage() {
  const { data, generatedSchedule, refreshSchedule, saveToFile } =
    useSchedule();
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  const getCampName = (campId: string) =>
    data.camps.find((c) => c.id === campId)?.name ?? campId;

  const getCampMaxSize = (campId: string) =>
    data.camps.find((c) => c.id === campId)?.maxSize ?? 0;

  const getStudentName = (studentId: string) => {
    const s = data.students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : studentId;
  };

  const getStudentGender = (studentId: string) =>
    data.students.find((s) => s.id === studentId)?.gender ?? 'other';

  const getStudentFriendGroup = (campId: string, studentId: string) => {
    const registration = data.registrations.find((r) => r.campId === campId);
    if (!registration) return null;
    const groupIndex = registration.friendGroups.findIndex((g) =>
      g.includes(studentId)
    );
    return groupIndex >= 0 ? groupIndex + 1 : null;
  };

  const genderColor = (gender: string) => {
    if (gender === 'male') return '#bbdefb';
    if (gender === 'female') return '#f8bbd0';
    return '#e8f5e9';
  };

  const uniqueWeeks = Array.from(new Set(data.camps.map((c) => c.week))).sort(
    (a, b) => {
      const dateA = dayjs(a, ['MMMM D', 'MMM D']);
      const dateB = dayjs(b, ['MMMM D', 'MMM D']);
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
    }
  );

  const allInstancesByCamp = (generatedSchedule?.instances ?? []).reduce<
    Record<string, CampInstance[]>
  >((acc, inst) => {
    (acc[inst.campId] ??= []).push(inst);
    return acc;
  }, {});

  const campsInSelectedWeek = new Set(
    data.camps
      .filter((c) => !selectedWeek || c.week === selectedWeek)
      .map((c) => c.id)
  );

  const instancesByCamp = Object.fromEntries(
    Object.entries(allInstancesByCamp).filter(([campId]) =>
      campsInSelectedWeek.has(campId)
    )
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">Schedule</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {uniqueWeeks.length > 0 && (
            <FormControl sx={{ minWidth: 200 }}>
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
          <Button
            variant="outlined"
            startIcon={<SaveAltIcon />}
            onClick={saveToFile}
          >
            Export JSON
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            onClick={refreshSchedule}
          >
            Generate Schedule
          </Button>
        </Box>
      </Box>
      {!generatedSchedule && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" gutterBottom>
            No schedule generated yet
          </Typography>
          <Typography variant="body2">
            Click "Generate Schedule" to automatically create camp instances
            from current registrations.
          </Typography>
        </Box>
      )}
      {generatedSchedule && Object.keys(instancesByCamp).length === 0 && (
        <Typography
          sx={{
            color: 'text.secondary',
          }}
        >
          No camps have any enrolled students. Add registrations first.
        </Typography>
      )}
      {!selectedWeek && generatedSchedule
        ? uniqueWeeks.map((week) => {
            const campsInWeek = Object.entries(instancesByCamp).filter(
              ([campId]) =>
                data.camps.find((c) => c.id === campId)?.week === week
            );
            if (campsInWeek.length === 0) return null;
            return (
              <Box
                key={week}
                sx={{
                  mb: 6,
                  pb: 4,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'action.hover',
                    fontWeight: 600,
                  }}
                >
                  {week}
                </Typography>
                {campsInWeek.map(([campId, instances]) => (
                  <Box key={campId} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="h6">
                        {getCampName(campId)}
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            ml: 1,
                          }}
                        >
                          (max {getCampMaxSize(campId)})
                        </Typography>
                      </Typography>
                      <Chip
                        label={`${instances.length} instance${instances.length > 1 ? 's' : ''}`}
                        size="small"
                        color={instances.length > 1 ? 'warning' : 'default'}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {instances.map((inst) => (
                        <Card
                          key={inst.id}
                          variant="outlined"
                          sx={{ flex: '1 1 200px', maxWidth: 280 }}
                        >
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              Instance {inst.instanceNumber} —{' '}
                              {inst.studentIds.length} student
                              {inst.studentIds.length !== 1 ? 's' : ''}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                              }}
                            >
                              {inst.studentIds.map((id) => {
                                const friendGroup = getStudentFriendGroup(
                                  inst.campId,
                                  id
                                );
                                return (
                                  <Box
                                    key={id}
                                    sx={{
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: 1,
                                      bgcolor: genderColor(
                                        getStudentGender(id)
                                      ),
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {getStudentName(id)}
                                    {friendGroup && (
                                      <Typography
                                        component="span"
                                        sx={{
                                          ml: 0.5,
                                          fontWeight: 500,
                                          color: 'rgba(0,0,0,0.6)',
                                        }}
                                      >
                                        (Friend Group {friendGroup})
                                      </Typography>
                                    )}
                                  </Box>
                                );
                              })}
                              {inst.studentIds.length === 0 && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.secondary',
                                  }}
                                >
                                  No students assigned
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            );
          })
        : Object.entries(instancesByCamp).map(([campId, instances]) => (
            <Box key={campId} sx={{ mb: 4 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}
              >
                <Typography variant="h6">
                  {getCampName(campId)}
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      ml: 1,
                    }}
                  >
                    (max {getCampMaxSize(campId)})
                  </Typography>
                </Typography>
                <Chip
                  label={`${instances.length} instance${instances.length > 1 ? 's' : ''}`}
                  size="small"
                  color={instances.length > 1 ? 'warning' : 'default'}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {instances.map((inst) => (
                  <Card
                    key={inst.id}
                    variant="outlined"
                    sx={{ flex: '1 1 200px', maxWidth: 280 }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Instance {inst.instanceNumber} —{' '}
                        {inst.studentIds.length} student
                        {inst.studentIds.length !== 1 ? 's' : ''}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        {inst.studentIds.map((id) => {
                          const friendGroup = getStudentFriendGroup(
                            inst.campId,
                            id
                          );
                          return (
                            <Box
                              key={id}
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: genderColor(getStudentGender(id)),
                                fontSize: '0.875rem',
                              }}
                            >
                              {getStudentName(id)}
                              {friendGroup && (
                                <Typography
                                  component="span"
                                  sx={{
                                    ml: 0.5,
                                    fontWeight: 500,
                                    color: 'rgba(0,0,0,0.6)',
                                  }}
                                >
                                  (Friend Group {friendGroup})
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                        {inst.studentIds.length === 0 && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            No students assigned
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          ))}
    </Box>
  );
}
