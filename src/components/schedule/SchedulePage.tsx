import { useState } from 'react';
import {
  Button,
  CardContent,
  Chip,
  Divider,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Tooltip,
  Typography,
  Badge,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GroupsIcon from '@mui/icons-material/Groups';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import PrintIcon from '@mui/icons-material/Print';
import ListIcon from '@mui/icons-material/List';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/hooks/useSchedule';
import type { CampInstance, Gender } from '@/models/types';
import {
  exportClassroomRoster,
  exportPrintableMasterlist,
  exportSignInOutSheet,
} from '@/services/exports';
import { printLabels } from '@/services/labelService';
import { PageHeaderRow } from '@/components/shared/shared.styles';
import {
  CampHeaderRow,
  CampMaxSizeSpan,
  CampSection,
  ControlsRow,
  EmptyState,
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

interface DragPayload {
  studentId: string;
  fromInstanceId: string;
  campId: string;
}

interface CampBlockProps {
  campId: string;
  instances: CampInstance[];
  getCampName: (id: string) => string;
  getCampMaxSize: (id: string) => number;
  getStudentName: (id: string) => string;
  getStudentSortKey: (id: string) => string;
  getStudentGender: (id: string) => Gender;
  getStudentFriendGroup: (campId: string, studentId: string) => number | null;
  onMoveStudent: (
    studentId: string,
    fromInstanceId: string,
    toInstanceId: string
  ) => void;
}

function CampBlock({
  campId,
  instances,
  getCampName,
  getCampMaxSize,
  getStudentName,
  getStudentSortKey,
  getStudentGender,
  getStudentFriendGroup,
  onMoveStudent,
}: CampBlockProps) {
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [dragOverInstanceId, setDragOverInstanceId] = useState<string | null>(
    null
  );

  const handleDragStart = (
    e: React.DragEvent,
    studentId: string,
    fromInstanceId: string
  ) => {
    const payload: DragPayload = { studentId, fromInstanceId, campId };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDragging(payload);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOverInstanceId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (instanceId: string) => {
    setDragOverInstanceId(instanceId);
  };

  const handleDragLeave = (e: React.DragEvent, instanceId: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverInstanceId((prev) => (prev === instanceId ? null : prev));
    }
  };

  const handleDrop = (e: React.DragEvent, toInstanceId: string) => {
    e.preventDefault();
    setDragOverInstanceId(null);
    setDragging(null);
    try {
      const payload: DragPayload = JSON.parse(
        e.dataTransfer.getData('text/plain')
      );
      if (
        payload.campId === campId &&
        payload.fromInstanceId !== toInstanceId
      ) {
        onMoveStudent(payload.studentId, payload.fromInstanceId, toInstanceId);
      }
    } catch {
      // ignore malformed drag data
    }
  };

  const isDragging = dragging !== null;

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
        {instances.map((inst) => {
          const isOver =
            dragOverInstanceId === inst.id &&
            dragging?.fromInstanceId !== inst.id;
          const isSource = dragging?.fromInstanceId === inst.id;

          return (
            <InstanceCard
              key={inst.id}
              variant="outlined"
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(inst.id)}
              onDragLeave={(e) => handleDragLeave(e, inst.id)}
              onDrop={(e) => handleDrop(e, inst.id)}
              sx={
                isOver
                  ? {
                      outline: '2px dashed',
                      outlineColor: 'primary.main',
                      bgcolor: 'primary.50',
                    }
                  : isDragging && !isSource
                    ? { outline: '1px dashed', outlineColor: 'divider' }
                    : {}
              }
            >
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Instance {inst.instanceNumber} — {inst.studentIds.length}{' '}
                  student
                  {inst.studentIds.length !== 1 ? 's' : ''}
                </Typography>
                <StudentList>
                  {[...inst.studentIds]
                    .sort((a, b) =>
                      getStudentSortKey(a).localeCompare(getStudentSortKey(b))
                    )
                    .map((id) => {
                    const friendGroup = getStudentFriendGroup(campId, id);
                    const isPillDragging =
                      dragging?.studentId === id &&
                      dragging?.fromInstanceId === inst.id;
                    return (
                      <StudentPill
                        key={id}
                        gender={getStudentGender(id)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, id, inst.id)}
                        onDragEnd={handleDragEnd}
                        sx={{
                          cursor: 'grab',
                          opacity: isPillDragging ? 0.4 : 1,
                          '&:active': { cursor: 'grabbing' },
                        }}
                      >
                        <span>{getStudentName(id)}</span>
                        {friendGroup && (
                          <Tooltip
                            title={`Friend Group ${friendGroup}`}
                            placement="right"
                          >
                            <Badge
                              badgeContent={friendGroup}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  bottom: 12,
                                },
                                marginRight: 1.25,
                              }}
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                              }}
                            >
                              <GroupsIcon color="secondary" />
                            </Badge>
                          </Tooltip>
                        )}
                      </StudentPill>
                    );
                  })}
                  {inst.studentIds.length === 0 && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      No students assigned
                    </Typography>
                  )}
                </StudentList>
              </CardContent>
            </InstanceCard>
          );
        })}
      </InstanceCardsRow>
    </CampSection>
  );
}

export function SchedulePage() {
  const { data, generatedSchedule, moveStudentBetweenInstances, refreshSchedule, saveToFile } =
    useSchedule();
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [exportMenuAnchor, setExportMenuAnchor] =
    useState<HTMLElement | null>(null);

  const getCampName = (campId: string) =>
    data.camps.find((c) => c.id === campId)?.name ?? campId;

  const getCampMaxSize = (campId: string) =>
    data.camps.find((c) => c.id === campId)?.maxSize ?? 0;

  const getStudentName = (studentId: string) => {
    const s = data.students.find((st) => st.id === studentId);
    return s ? `${s.lastName}, ${s.firstName}` : studentId;
  };

  const getStudentSortKey = (studentId: string) => {
    const s = data.students.find((st) => st.id === studentId);
    return s ? `${s.lastName}\t${s.firstName}` : studentId;
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

  const campBlockProps = (campId: string, instances: CampInstance[]) => ({
    campId,
    instances,
    getCampName,
    getCampMaxSize,
    getStudentName,
    getStudentSortKey,
    getStudentGender,
    getStudentFriendGroup,
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
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => { setExportMenuAnchor(null); saveToFile(); }}>
              <CodeIcon sx={{ mr: 1.5 }} />
              Export JSON
            </MenuItem>
            <Divider />
            <MenuItem
              disabled={!generatedSchedule || !selectedWeek}
              onClick={() => {
                setExportMenuAnchor(null);
                void exportPrintableMasterlist(
                  data,
                  Object.values(instancesByCamp).flat()
                );
              }}
            >
              <TableChartIcon sx={{ mr: 1.5 }} />
              Printable Masterlist
            </MenuItem>
            <MenuItem
              disabled={!generatedSchedule || !selectedWeek}
              onClick={() => {
                setExportMenuAnchor(null);
                void exportClassroomRoster(
                  data,
                  Object.values(instancesByCamp).flat()
                );
              }}
            >
              <ListIcon sx={{ mr: 1.5 }} />
              Classroom Roster
            </MenuItem>
            <MenuItem
              disabled={!generatedSchedule || !selectedWeek}
              onClick={() => {
                setExportMenuAnchor(null);
                void exportSignInOutSheet(
                  data,
                  Object.values(instancesByCamp).flat()
                );
              }}
            >
              <TableChartIcon sx={{ mr: 1.5 }} />
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
              <PrintIcon sx={{ mr: 1.5 }} />
              Print Labels
            </MenuItem>
          </Menu>
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
                <WeekHeading variant="h5">{week}</WeekHeading>
                {campsInWeek.map(([campId, instances]) => (
                  <CampBlock key={campId} {...campBlockProps(campId, instances)} />
                ))}
              </WeekSection>
            );
          })
        : Object.entries(instancesByCamp).map(([campId, instances]) => (
            <CampBlock key={campId} {...campBlockProps(campId, instances)} />
          ))}
    </div>
  );
}
