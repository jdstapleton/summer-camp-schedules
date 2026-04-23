import { useState } from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useSchedule } from '@/contexts/ScheduleContext';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card sx={{ minWidth: 160 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h3">{value}</Typography>
        <Typography variant="subtitle1" sx={{
          color: "text.secondary"
        }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, loadFromFile, saveToFile, clearData } = useSchedule();
  const [confirmClear, setConfirmClear] = useState(false);

  const activeRegistrations = data.registrations.filter(
    (r) => r.studentIds.length > 0
  ).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={() => void loadFromFile()}>
          Open Schedule File
        </Button>
        <Button variant="outlined" onClick={saveToFile}>
          Save Schedule File
        </Button>
        <Button variant="outlined" color="error" onClick={() => setConfirmClear(true)}>
          New Schedule
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard title="Students" value={data.students.length} />
        <StatCard title="Camps" value={data.camps.length} />
        <StatCard title="Active Registrations" value={activeRegistrations} />
      </Box>

      <ConfirmDialog
        open={confirmClear}
        title="Start New Schedule"
        message="Clear all data and start fresh? This cannot be undone. (Your browser's saved data will also be cleared.)"
        onConfirm={clearData}
        onClose={() => setConfirmClear(false)}
      />
    </Box>
  );
}
