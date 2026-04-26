import { useRef, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useSchedule } from '@/hooks/useSchedule';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ImportExcelDialog } from './ImportExcelDialog';
import { ButtonRow, StatCardContent, StatCardRoot, StatCardSubtitle, StatCardsRow } from './DashboardPage.styles';

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <StatCardRoot>
      <StatCardContent>
        <Typography variant="h3">{value}</Typography>
        <StatCardSubtitle variant="subtitle1">{title}</StatCardSubtitle>
      </StatCardContent>
    </StatCardRoot>
  );
}

export function DashboardPage() {
  const { data, loadFromFile, saveToFile, clearData } = useSchedule();
  const [confirmClear, setConfirmClear] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeRegistrations = data.registrations.filter((r) => r.studentIds.length > 0).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImportFile(file);
    e.target.value = '';
  };

  const handleImportClose = () => {
    setImportFile(null);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <ButtonRow>
        <Button variant="outlined" color="error" onClick={() => setConfirmClear(true)}>
          New Schedule
        </Button>
        <Button variant="contained" onClick={() => fileInputRef.current?.click()}>
          Import from Excel
        </Button>
        <Button variant="outlined" onClick={saveToFile}>
          Save Schedule File
        </Button>
        <Button variant="outlined" onClick={() => void loadFromFile()}>
          Open Schedule File
        </Button>
      </ButtonRow>
      <input ref={fileInputRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleFileChange} />
      <StatCardsRow>
        <StatCard title="Students" value={data.students.length} />
        <StatCard title="Camps" value={data.camps.length} />
        <StatCard title="Active Registrations" value={activeRegistrations} />
      </StatCardsRow>

      <ConfirmDialog
        open={confirmClear}
        title="Start New Schedule"
        message="Clear all data and start fresh? This cannot be undone. (Your browser's saved data will also be cleared.)"
        onConfirm={clearData}
        onClose={() => setConfirmClear(false)}
      />

      <ImportExcelDialog file={importFile} onClose={handleImportClose} />
    </div>
  );
}
