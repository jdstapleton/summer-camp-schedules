import { useState, useMemo } from 'react';
import type { Student, ScheduleData } from '@/models/types';

interface Filters {
  name: string;
  camps: string[];
  age: string;
  custody: string[];
  tshirtSize: string[];
}

const hasNutAllergy = (student: Student): boolean => {
  return (
    student.medicalIssues.toLowerCase().includes('nut') ||
    student.specialRequest.toLowerCase().includes('nut')
  );
};

const hasAllergy = (student: Student): boolean => {
  return (
    student.medicalIssues.toLowerCase().includes('allerg') ||
    student.specialRequest.toLowerCase().includes('allerg') ||
    hasNutAllergy(student)
  );
};

const compareValues = (a: unknown, b: unknown): number => {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return 0;
};

export function useStudentFilters(data: ScheduleData) {
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Filters>({
    name: '',
    camps: [],
    age: '',
    custody: [],
    tshirtSize: [],
  });
  const [showOnlyAllergies, setShowOnlyAllergies] = useState(false);
  const [filterNoPhoto, setFilterNoPhoto] = useState(false);
  const [filterPreCamp, setFilterPreCamp] = useState(false);
  const [filterPostCamp, setFilterPostCamp] = useState(false);
  const [filterMedical, setFilterMedical] = useState(false);
  const [filterSpecialRequest, setFilterSpecialRequest] = useState(false);

  const uniqueCamps = useMemo(
    () =>
      Array.from(
        new Set(data.camps.map((c) => c.name))
      ).sort(),
    [data.camps]
  );

  const uniqueCustody = useMemo(
    () =>
      Array.from(
        new Set(data.students.map((s) => s.custody))
      ).sort(),
    [data.students]
  );

  const uniqueTshirtSizes = useMemo(
    () =>
      Array.from(
        new Set(data.students.map((s) => s.tshirtSize))
      ).sort(),
    [data.students]
  );

  const handleSort = (column: string) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const handleMultiSelectChange = (
    key: 'camps' | 'custody' | 'tshirtSize',
    value: string[]
  ) => {
    if (value.includes('')) {
      setFilters({ ...filters, [key]: [] });
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const sortedStudents = useMemo(() => {
    const filtered = [...data.students].filter((student) => {
      if (filters.name) {
        const fullName = `${student.lastName}, ${student.firstName}`.toLowerCase();
        if (!fullName.includes(filters.name.toLowerCase())) return false;
      }
      if (filters.camps.length > 0) {
        const studentCamps = data.registrations
          .filter((reg) => reg.studentIds.includes(student.id))
          .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
          .filter(Boolean);
        if (!filters.camps.some((camp) => studentCamps.includes(camp))) return false;
      }
      if (filters.age) {
        if (student.age.toString() !== filters.age) return false;
      }
      if (filters.custody.length > 0) {
        if (!filters.custody.includes(student.custody)) return false;
      }
      if (filters.tshirtSize.length > 0) {
        if (!filters.tshirtSize.includes(student.tshirtSize)) return false;
      }
      if (showOnlyAllergies) {
        if (!hasAllergy(student)) return false;
      }
      if (filterMedical) {
        if (!student.medicalIssues) return false;
      }
      if (filterSpecialRequest) {
        if (!student.specialRequest) return false;
      }
      if (filterNoPhoto) {
        if (student.photo) return false;
      }
      if (filterPreCamp) {
        if (!student.preCamp) return false;
      }
      if (filterPostCamp) {
        if (!student.postCamp) return false;
      }
      return true;
    });

    const sorted = filtered.sort((a, b) => {
      let aVal: unknown;
      let bVal: unknown;

      switch (orderBy) {
        case 'name':
          aVal = `${a.lastName}, ${a.firstName}`;
          bVal = `${b.lastName}, ${b.firstName}`;
          break;
        case 'camps':
          aVal = data.registrations
            .filter((reg) => reg.studentIds.includes(a.id))
            .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
            .filter(Boolean)
            .join(', ');
          bVal = data.registrations
            .filter((reg) => reg.studentIds.includes(b.id))
            .map((reg) => data.camps.find((c) => c.id === reg.campId)?.name)
            .filter(Boolean)
            .join(', ');
          break;
        case 'age':
          aVal = a.age;
          bVal = b.age;
          break;
        case 'custody':
          aVal = a.custody;
          bVal = b.custody;
          break;
        case 'tshirtSize':
          aVal = a.tshirtSize;
          bVal = b.tshirtSize;
          break;
        default:
          return 0;
      }

      const comparison = compareValues(aVal, bVal);
      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, filters, orderBy, order, showOnlyAllergies, filterNoPhoto, filterPreCamp, filterPostCamp, filterMedical, filterSpecialRequest]);

  return {
    orderBy,
    order,
    filters,
    showOnlyAllergies,
    filterNoPhoto,
    filterPreCamp,
    filterPostCamp,
    filterMedical,
    filterSpecialRequest,
    uniqueCamps,
    uniqueCustody,
    uniqueTshirtSizes,
    sortedStudents,
    setOrderBy,
    setOrder,
    setFilters,
    setShowOnlyAllergies,
    setFilterNoPhoto,
    setFilterPreCamp,
    setFilterPostCamp,
    setFilterMedical,
    setFilterSpecialRequest,
    handleSort,
    handleMultiSelectChange,
  };
}
