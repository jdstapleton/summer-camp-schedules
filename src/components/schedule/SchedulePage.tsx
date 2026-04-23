import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { ClassInstance } from '@/models/types';

export function SchedulePage() {
  const { data, generatedSchedule, refreshSchedule, saveToFile } =
    useSchedule();

  const getClassName = (classTypeId: string) =>
    data.classTypes.find((ct) => ct.id === classTypeId)?.name ?? classTypeId;

  const getStudentName = (studentId: string) => {
    const s = data.students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : studentId;
  };

  const getStudentGender = (studentId: string) =>
    data.students.find((s) => s.id === studentId)?.gender ?? 'other';

  const genderColor = (gender: string) => {
    if (gender === 'male') return '#bbdefb';
    if (gender === 'female') return '#f8bbd0';
    return '#e8f5e9';
  };

  const instancesByClass = (generatedSchedule?.instances ?? []).reduce<
    Record<string, ClassInstance[]>
  >((acc, inst) => {
    (acc[inst.classTypeId] ??= []).push(inst);
    return acc;
  }, {});

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
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            Click "Generate Schedule" to automatically create class instances
            from current registrations.
          </Typography>
        </Box>
      )}

      {generatedSchedule && Object.keys(instancesByClass).length === 0 && (
        <Typography color="text.secondary">
          No classes have any enrolled students. Add registrations first.
        </Typography>
      )}

      {Object.entries(instancesByClass).map(([classTypeId, instances]) => (
        <Box key={classTypeId} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Typography variant="h6">{getClassName(classTypeId)}</Typography>
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
                    Instance {inst.instanceNumber} — {inst.studentIds.length}{' '}
                    student{inst.studentIds.length !== 1 ? 's' : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {inst.studentIds.map((id) => (
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
                      </Box>
                    ))}
                    {inst.studentIds.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
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
