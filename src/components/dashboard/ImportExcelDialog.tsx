import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { CampDialog } from '@/components/camps/CampDialog';
import { useSchedule } from '@/hooks/useSchedule';
import type { Camp } from '@/models/types';
import type { ImportBatchPayload } from '@/models/contexts';
import { randomSafetyCode } from '@/services/dataMigrations';
import {
  parseXlsx,
  type ParsedImport,
  type ParsedStudent,
} from '@/services/importService';

interface ImportExcelDialogProps {
  file: File | null;
  onClose: () => void;
}

type Phase =
  | { kind: 'parsing' }
  | { kind: 'review'; parsed: ParsedImport; newCampNames: string[] }
  | {
      kind: 'collectingCampInfo';
      parsed: ParsedImport;
      newCampNames: string[];
      collected: Omit<Camp, 'id'>[];
      index: number;
    }
  | {
      kind: 'committing';
      parsed: ParsedImport;
      newCamps: Omit<Camp, 'id'>[];
    }
  | { kind: 'done'; summary: string }
  | { kind: 'error'; message: string };

const parsedStudentToNew = (
  p: ParsedStudent
): ImportBatchPayload['newStudents'][number] => ({
  dedupeKey: p.dedupeKey,
  firstName: p.firstName,
  lastName: p.lastName,
  gender: p.gender,
  age: p.age,
  custody: p.custody,
  safetyCode: randomSafetyCode(),
  photo: p.photo,
  preCamp: p.preCamp,
  postCamp: p.postCamp,
  specialRequest: p.specialRequest,
  medicalIssues: p.medicalIssues,
  primary: p.primary,
  secondary: p.secondary,
  emergency: p.emergency,
});

export function ImportExcelDialog({ file, onClose }: ImportExcelDialogProps) {
  const { data, importBatch } = useSchedule();
  const [phase, setPhase] = useState<Phase>({ kind: 'parsing' });

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase({ kind: 'parsing' });

    const run = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const parsed = await parseXlsx(buffer);
        if (cancelled) return;

        const existingCampNames = new Set(
          data.camps.map((c) => c.name.trim().toLowerCase())
        );
        const newCampNames = parsed.campNames.filter(
          (n) => !existingCampNames.has(n.trim().toLowerCase())
        );

        setPhase({ kind: 'review', parsed, newCampNames });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Failed to parse Excel file.';
        setPhase({ kind: 'error', message });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [file, data.camps]);

  const commit = (
    parsed: ParsedImport,
    newCamps: Omit<Camp, 'id'>[]
  ): void => {
    setPhase({ kind: 'committing', parsed, newCamps });

    const existingKeys = new Set(
      data.students.map(
        (s) =>
          `${s.lastName.trim().toLowerCase()}|${s.firstName.trim().toLowerCase()}|${s.age}`
      )
    );

    const newStudents = parsed.students
      .filter((s) => !existingKeys.has(s.dedupeKey))
      .map(parsedStudentToNew);

    importBatch({
      newStudents,
      newCamps,
      registrationRows: parsed.registrationRows,
    });

    const matchedCount = parsed.students.length - newStudents.length;
    setPhase({
      kind: 'done',
      summary:
        `Imported ${newStudents.length} new student${newStudents.length === 1 ? '' : 's'}` +
        ` (${matchedCount} matched existing), ` +
        `${newCamps.length} new camp${newCamps.length === 1 ? '' : 's'}, ` +
        `${parsed.registrationRows.length} registration row${parsed.registrationRows.length === 1 ? '' : 's'}.`,
    });
  };

  const handleContinueFromReview = () => {
    if (phase.kind !== 'review') return;
    if (phase.newCampNames.length === 0) {
      commit(phase.parsed, []);
      return;
    }
    setPhase({
      kind: 'collectingCampInfo',
      parsed: phase.parsed,
      newCampNames: phase.newCampNames,
      collected: [],
      index: 0,
    });
  };

  const handleCampSaved = (camp: Omit<Camp, 'id'>) => {
    if (phase.kind !== 'collectingCampInfo') return;
    const collected = [...phase.collected, camp];
    const nextIndex = phase.index + 1;
    if (nextIndex >= phase.newCampNames.length) {
      commit(phase.parsed, collected);
    } else {
      setPhase({ ...phase, collected, index: nextIndex });
    }
  };

  const isOpen = file !== null;

  if (phase.kind === 'collectingCampInfo') {
    const campName = phase.newCampNames[phase.index];
    const stubCamp: Camp = {
      id: '',
      name: campName,
      gradeRange: '',
      week: '',
      maxSize: 16,
    };
    return (
      <CampDialog
        open={isOpen}
        camp={stubCamp}
        existingCamps={data.camps}
        onSave={handleCampSaved}
        onClose={onClose}
        titleOverride={`Import Camp ${phase.index + 1} of ${phase.newCampNames.length}: ${campName}`}
        saveLabelOverride={
          phase.index + 1 === phase.newCampNames.length ? 'Finish Import' : 'Next'
        }
      />
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import from Excel</DialogTitle>
      <DialogContent>
        {phase.kind === 'parsing' && (
          <Stack spacing={2}>
            <Typography>Parsing file…</Typography>
            <LinearProgress />
          </Stack>
        )}

        {phase.kind === 'review' && (
          <Stack spacing={2}>
            <Typography>
              <strong>{phase.parsed.students.length}</strong> unique student
              {phase.parsed.students.length === 1 ? '' : 's'} found across{' '}
              <strong>{phase.parsed.registrationRows.length}</strong>{' '}
              registration row
              {phase.parsed.registrationRows.length === 1 ? '' : 's'}.
            </Typography>
            <Typography>
              <strong>{phase.parsed.campNames.length}</strong> camp
              {phase.parsed.campNames.length === 1 ? '' : 's'} referenced;{' '}
              <strong>{phase.newCampNames.length}</strong> new.
            </Typography>
            {phase.parsed.skippedRows.length > 0 && (
              <Alert severity="info">
                {phase.parsed.skippedRows.length} row
                {phase.parsed.skippedRows.length === 1 ? '' : 's'} skipped.
              </Alert>
            )}
            {phase.parsed.warnings.length > 0 && (
              <Alert severity="warning">
                <Typography variant="body2" component="div">
                  {phase.parsed.warnings.length} warning
                  {phase.parsed.warnings.length === 1 ? '' : 's'}:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {phase.parsed.warnings.slice(0, 5).map((w, i) => (
                    <li key={i}>
                      <Typography variant="body2">{w}</Typography>
                    </li>
                  ))}
                  {phase.parsed.warnings.length > 5 && (
                    <li>
                      <Typography variant="body2">
                        …and {phase.parsed.warnings.length - 5} more.
                      </Typography>
                    </li>
                  )}
                </ul>
              </Alert>
            )}
            {phase.newCampNames.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                You'll be asked to enter week / grade range / max size for each
                new camp next.
              </Typography>
            )}
          </Stack>
        )}

        {phase.kind === 'committing' && (
          <Stack spacing={2}>
            <Typography>Importing…</Typography>
            <LinearProgress />
          </Stack>
        )}

        {phase.kind === 'done' && (
          <Alert severity="success">{phase.summary}</Alert>
        )}

        {phase.kind === 'error' && (
          <Alert severity="error">{phase.message}</Alert>
        )}
      </DialogContent>
      <DialogActions>
        {phase.kind === 'review' && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleContinueFromReview}>
              Continue
            </Button>
          </>
        )}
        {(phase.kind === 'done' || phase.kind === 'error') && (
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
