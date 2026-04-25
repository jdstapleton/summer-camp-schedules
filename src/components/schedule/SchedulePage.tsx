import { useState } from 'react';
import { Button, Divider, InputLabel, Select, MenuItem, Menu, Typography } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import PrintIcon from '@mui/icons-material/Print';
import BadgeIcon from '@mui/icons-material/Badge';
import ChecklistIcon from '@mui/icons-material/Checklist';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/hooks/useSchedule';
import type { CampInstance } from '@/models/types';
import { exportClassroomRoster, exportPrintableMasterlist, exportSignInOutSheet } from '@/services/exports';
import { printLabels } from '@/services/labelService';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import { ControlsRow, EmptyState, MenuItemIcon, MutedTypography, WeekFilterControl, WeekHeading, WeekSection } from './SchedulePage.styles';
import { CampBlock } from './CampBlock';

dayjs.extend(customParseFormat);

export function SchedulePage() {
  const { data, generatedSchedule, moveStudentBetweenInstances, refreshSchedule, saveToFile } = useSchedule();
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null);

  const getCampName = (campId: string) => data.camps.find((c) => c.id === campId)?.name ?? campId;

  const getCampMaxSize = (campId: string) => data.camps.find((c) => c.id === campId)?.maxSize ?? 0;

  const getStudentName = (studentId: string) => {
    const s = data.students.find((st) => st.id === studentId);
    return s ? `${s.lastName}, ${s.firstName}` : studentId;
  };

  const getStudentSortKey = (studentId: string) => {
    const s = data.students.find((st) => st.id === studentId);
    return s ? `${s.lastName}\t${s.firstName}` : studentId;
  };

  const getStudentGender = (studentId: string) => data.students.find((s) => s.id === studentId)?.gender ?? 'other';

  const getStudentFriendGroup = (campId: string, studentId: string) => {
    const registration = data.registrations.find((r) => r.campId === campId);
    if (!registration) return null;
    const groupIndex = registration.friendGroups.findIndex((g) => g.includes(studentId));
    return groupIndex >= 0 ? groupIndex + 1 : null;
  };

  const getStudentNotes = (studentId: string) => {
    const s = data.students.find((st) => st.id === studentId);
    return {
      medical: s?.medicalIssues ?? '',
      special: s?.specialRequest ?? '',
    };
  };

  const hasNutAllergy = (instance: CampInstance): boolean => {
    return instance.studentIds.some((studentId) => {
      const student = data.students.find((s) => s.id === studentId);
      return student?.medicalIssues.toLowerCase().includes('nut') || student?.specialRequest.toLowerCase().includes('nut');
    });
  };

  const uniqueWeeks = Array.from(new Set(data.camps.map((c) => c.week))).sort((a, b) => {
    const dateA = dayjs(a, ['MMMM D', 'MMM D']);
    const dateB = dayjs(b, ['MMMM D', 'MMM D']);
    return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
  });

  const allInstancesByCamp = (generatedSchedule?.instances ?? []).reduce<Record<string, CampInstance[]>>((acc, inst) => {
    (acc[inst.campId] ??= []).push(inst);
    return acc;
  }, {});

  const campsInSelectedWeek = new Set(data.camps.filter((c) => !selectedWeek || c.week === selectedWeek).map((c) => c.id));

  const instancesByCamp = Object.fromEntries(Object.entries(allInstancesByCamp).filter(([campId]) => campsInSelectedWeek.has(campId)));

  const campBlockProps = (campId: string, instances: CampInstance[]) => ({
    campId,
    instances,
    getCampName,
    getCampMaxSize,
    getStudentName,
    getStudentSortKey,
    getStudentGender,
    getStudentFriendGroup,
    getStudentNotes,
    hasNutAllergy,
    onMoveStudent: moveStudentBetweenInstances,
  });

  return (
    <div>
      <PageHeaderRow mb={3}>
        <Typography variant="h4">Schedule</Typography>
        <ControlsRow>
          {uniqueWeeks.length > 0 && (
            <WeekFilterControl>
              <InputLabel>Week</InputLabel>
              <Select value={selectedWeek} label="Week" onChange={(e) => setSelectedWeek(e.target.value)}>
                <MenuItem value="">All Weeks</MenuItem>
                {uniqueWeeks.map((week) => (
                  <MenuItem key={week} value={week}>
                    {week}
                  </MenuItem>
                ))}
              </Select>
            </WeekFilterControl>
          )}
          <Button variant="outlined" startIcon={<SaveAltIcon />} endIcon={<ArrowDropDownIcon />} onClick={(e) => setExportMenuAnchor(e.currentTarget)}>
            Export
          </Button>
          <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={() => setExportMenuAnchor(null)}>
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                saveToFile();
              }}
            >
              <MenuItemIcon>
                <CodeIcon />
              </MenuItemIcon>
              Export JSON
            </MenuItem>
            <Divider />
            <MenuItem
              disabled={!generatedSchedule || !selectedWeek}
              onClick={() => {
                setExportMenuAnchor(null);
                void exportPrintableMasterlist(data, Object.values(instancesByCamp).flat());
              }}
            >
              <MenuItemIcon>
                <TableChartIcon />
              </MenuItemIcon>
              Printable Masterlist
            </MenuItem>
            <MenuItem
              disabled={!generatedSchedule || !selectedWeek}
              onClick={() => {
                setExportMenuAnchor(null);
                void exportClassroomRoster(data, Object.values(instancesByCamp).flat());
              }}
            >
              <MenuItemIcon>
                <BadgeIcon />
              </MenuItemIcon>
              Classroom Roster
            </MenuItem>
            <MenuItem
              disabled={!generatedSchedule || !selectedWeek}
              onClick={() => {
                setExportMenuAnchor(null);
                void exportSignInOutSheet(data, Object.values(instancesByCamp).flat());
              }}
            >
              <MenuItemIcon>
                <ChecklistIcon />
              </MenuItemIcon>
              Sign In &amp; Sign Out Sheet
            </MenuItem>
            <Divider />
            <MenuItem
              disabled={!generatedSchedule}
              onClick={() => {
                setExportMenuAnchor(null);
                if (generatedSchedule) printLabels(data, Object.values(instancesByCamp).flat());
              }}
            >
              <MenuItemIcon>
                <PrintIcon />
              </MenuItemIcon>
              Print Labels
            </MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AutoFixHighIcon />} onClick={refreshSchedule}>
            Generate Schedule
          </Button>
        </ControlsRow>
      </PageHeaderRow>
      {!generatedSchedule && (
        <EmptyState>
          <Typography variant="h6" gutterBottom>
            No schedule generated yet
          </Typography>
          <Typography variant="body2">Click "Generate Schedule" to automatically create camp instances from current registrations.</Typography>
        </EmptyState>
      )}
      {generatedSchedule && Object.keys(instancesByCamp).length === 0 && <MutedTypography>No camps have any enrolled students. Add registrations first.</MutedTypography>}
      {!selectedWeek && generatedSchedule
        ? uniqueWeeks.map((week) => {
            const campsInWeek = Object.entries(instancesByCamp).filter(([campId]) => data.camps.find((c) => c.id === campId)?.week === week);
            if (campsInWeek.length === 0) return null;
            return (
              <WeekSection key={week}>
                <WeekHeading variant="h5">{week}</WeekHeading>
                {campsInWeek.map(([campId, instances]) => (
                  <CampBlock key={campId} {...campBlockProps(campId, instances)} />
                ))}
              </WeekSection>
            );
          })
        : Object.entries(instancesByCamp).map(([campId, instances]) => <CampBlock key={campId} {...campBlockProps(campId, instances)} />)}
    </div>
  );
}
