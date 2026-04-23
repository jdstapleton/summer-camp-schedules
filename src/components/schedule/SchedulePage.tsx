import { useState } from 'react';
import {
  Button,
  CardContent,
  Chip,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import TableChartIcon from '@mui/icons-material/TableChart';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/hooks/useSchedule';
import type { CampInstance, Gender } from '@/models/types';
import { exportScheduleToExcel } from '@/services/excelService';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import {
  CampHeaderRow,
  CampMaxSizeSpan,
  CampSection,
  ControlsRow,
  EmptyState,
  FriendGroupSpan,
  InstanceCard,
  InstanceCardsRow,
  MutedTypography,
  StudentList,
  StudentPill,
  WeekFilterControl,
  WeekHeading,
  WeekSection,
} from './SchedulePage.styles';

dayjs.extend(customParseFormat);

interface CampBlockProps {
  campId: string;
  instances: CampInstance[];
  getCampName: (id: string) => string;
  getCampMaxSize: (id: string) => number;
  getStudentName: (id: string) => string;
  getStudentGender: (id: string) => Gender;
  getStudentFriendGroup: (campId: string, studentId: string) => number | null;
}

function CampBlock({
  campId,
  instances,
  getCampName,
  getCampMaxSize,
  getStudentName,
  getStudentGender,
  getStudentFriendGroup,
}: CampBlockProps) {
  return (
    <CampSection>
      <CampHeaderRow>
        <Typography variant="h6">
          {getCampName(campId)}
          <CampMaxSizeSpan variant="body2">
            (max {getCampMaxSize(campId)})
          </CampMaxSizeSpan>
        </Typography>
        <Chip
          label={`${instances.length} instance${instances.length > 1 ? 's' : ''}`}
          size="small"
          color={instances.length > 1 ? 'warning' : 'default'}
        />
      </CampHeaderRow>

      <InstanceCardsRow>
        {instances.map((inst) => (
          <InstanceCard
            key={inst.id}
            variant="outlined"
          >
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Instance {inst.instanceNumber} —{' '}
                {inst.studentIds.length} student
                {inst.studentIds.length !== 1 ? 's' : ''}
              </Typography>
              <StudentList>
                {inst.studentIds.map((id) => {
                  const friendGroup = getStudentFriendGroup(campId, id);
                  return (
                    <StudentPill key={id} gender={getStudentGender(id)}>
                      {getStudentName(id)}
                      {friendGroup && (
                        <FriendGroupSpan>
                          (Friend Group {friendGroup})
                        </FriendGroupSpan>
                      )}
                    </StudentPill>
                  );
                })}
                {inst.studentIds.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No students assigned
                  </Typography>
                )}
              </StudentList>
            </CardContent>
          </InstanceCard>
        ))}
      </InstanceCardsRow>
    </CampSection>
  );
}

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
    <div>
      <PageHeaderRow mb={3}>
        <Typography variant="h4">Schedule</Typography>
        <ControlsRow>
          {uniqueWeeks.length > 0 && (
            <WeekFilterControl>
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
            </WeekFilterControl>
          )}
          <Button
            variant="outlined"
            startIcon={<SaveAltIcon />}
            onClick={saveToFile}
          >
            Export JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={<TableChartIcon />}
            disabled={!generatedSchedule}
            onClick={() =>
              generatedSchedule &&
              exportScheduleToExcel(data, generatedSchedule)
            }
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            onClick={refreshSchedule}
          >
            Generate Schedule
          </Button>
        </ControlsRow>
      </PageHeaderRow>
      {!generatedSchedule && (
        <EmptyState>
          <Typography variant="h6" gutterBottom>
            No schedule generated yet
          </Typography>
          <Typography variant="body2">
            Click "Generate Schedule" to automatically create camp instances
            from current registrations.
          </Typography>
        </EmptyState>
      )}
      {generatedSchedule && Object.keys(instancesByCamp).length === 0 && (
        <MutedTypography>
          No camps have any enrolled students. Add registrations first.
        </MutedTypography>
      )}
      {!selectedWeek && generatedSchedule
        ? uniqueWeeks.map((week) => {
            const campsInWeek = Object.entries(instancesByCamp).filter(
              ([campId]) =>
                data.camps.find((c) => c.id === campId)?.week === week
            );
            if (campsInWeek.length === 0) return null;
            return (
              <WeekSection key={week}>
                <WeekHeading variant="h5">
                  {week}
                </WeekHeading>
                {campsInWeek.map(([campId, instances]) => (
                  <CampBlock
                    key={campId}
                    campId={campId}
                    instances={instances}
                    getCampName={getCampName}
                    getCampMaxSize={getCampMaxSize}
                    getStudentName={getStudentName}
                    getStudentGender={getStudentGender}
                    getStudentFriendGroup={getStudentFriendGroup}
                  />
                ))}
              </WeekSection>
            );
          })
        : Object.entries(instancesByCamp).map(([campId, instances]) => (
            <CampBlock
              key={campId}
              campId={campId}
              instances={instances}
              getCampName={getCampName}
              getCampMaxSize={getCampMaxSize}
              getStudentName={getStudentName}
              getStudentGender={getStudentGender}
              getStudentFriendGroup={getStudentFriendGroup}
            />
          ))}
    </div>
  );
}
