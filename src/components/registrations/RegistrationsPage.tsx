import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSchedule } from '@/hooks/useSchedule';
import type { Camp } from '@/models/types';
import { EnrollmentDialog } from './EnrollmentDialog';
import { RegistrationsDesktopPage } from './RegistrationsDesktopPage';
import { RegistrationsMobilePage } from './RegistrationsMobilePage';

dayjs.extend(customParseFormat);

type SortKey = 'name' | 'gradeRange' | 'week' | 'maxSize' | 'enrolled' | 'instances' | 'friendGroups';
type SortDirection = 'asc' | 'desc';

export function RegistrationsPage() {
  const { data, updateRegistration } = useSchedule();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [managingCamp, setManagingCamp] = useState<Camp | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [sortBy, setSortBy] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'week', direction: 'asc' });

  const getRegistration = (campId: string) =>
    data.registrations.find((r) => r.campId === campId) ?? {
      campId,
      studentIds: [],
      friendGroups: [],
    };

  const activeRegistration = managingCamp ? getRegistration(managingCamp.id) : null;

  const uniqueWeeks = Array.from(new Set(data.camps.map((c) => c.week))).sort((a, b) => {
    const dateA = dayjs(a, ['MMMM D', 'MMM D']);
    const dateB = dayjs(b, ['MMMM D', 'MMM D']);
    return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
  });

  const rows = data.camps
    .filter((c) => !selectedWeek || c.week === selectedWeek)
    .map((camp) => {
      const reg = getRegistration(camp.id);
      const enrolled = reg.studentIds.length;
      const instances = enrolled > 0 ? Math.ceil(enrolled / camp.maxSize) : 0;
      return { camp, reg, enrolled, instances, friendGroups: reg.friendGroups.length };
    });

  const dir = sortBy.direction === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    let cmp = 0;
    switch (sortBy.key) {
      case 'name':
        cmp = a.camp.name.localeCompare(b.camp.name);
        break;
      case 'gradeRange':
        cmp = a.camp.gradeRange.localeCompare(b.camp.gradeRange);
        break;
      case 'week': {
        const dateA = dayjs(a.camp.week, ['MMMM D', 'MMM D']);
        const dateB = dayjs(b.camp.week, ['MMMM D', 'MMM D']);
        cmp = dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
        break;
      }
      case 'maxSize':
        cmp = a.camp.maxSize - b.camp.maxSize;
        break;
      case 'enrolled':
        cmp = a.enrolled - b.enrolled;
        break;
      case 'instances':
        cmp = a.instances - b.instances;
        break;
      case 'friendGroups':
        cmp = a.friendGroups - b.friendGroups;
        break;
    }
    return cmp * dir;
  });

  const handleSort = (key: SortKey) => {
    setSortBy((prev) => (prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));
  };

  const sharedProps = {
    rows,
    uniqueWeeks,
    selectedWeek,
    onWeekChange: setSelectedWeek,
    onManage: setManagingCamp,
  };

  return (
    <>
      {isMobile ? <RegistrationsMobilePage {...sharedProps} /> : <RegistrationsDesktopPage {...sharedProps} sortBy={sortBy} onSort={handleSort} />}
      {managingCamp && activeRegistration && (
        <EnrollmentDialog
          open={true}
          camp={managingCamp}
          registration={activeRegistration}
          students={data.students}
          onSave={(reg) => {
            updateRegistration(reg);
            setManagingCamp(null);
          }}
          onClose={() => setManagingCamp(null)}
        />
      )}
    </>
  );
}
