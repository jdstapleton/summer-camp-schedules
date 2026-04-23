import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useSchedule } from '@/contexts/ScheduleContext';

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card sx={{ minWidth: 160 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h3">{value}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, loadFromFile, saveToFile } = useSchedule();

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
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard title="Students" value={data.students.length} />
        <StatCard title="Class Types" value={data.classTypes.length} />
        <StatCard title="Active Registrations" value={activeRegistrations} />
      </Box>
    </Box>
  );
}
