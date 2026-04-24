import type { CampInstance, ScheduleData, Student } from '@/models/types';
import {
  YELLOW_FILL,
  applyCellFill,
  getEmergencyPhone,
  getSecondaryCellPhone,
  saveWorkbook,
  studentSortCompare,
  yesOrBlank,
  yesOrNo,
} from './shared';

interface MasterlistRow {
  student: Student;
  campName: string;
}

export function buildMasterlistRows(
  data: ScheduleData,
  instances: CampInstance[]
): MasterlistRow[] {
  const campMap = new Map(data.camps.map((c) => [c.id, c]));
  const studentMap = new Map(data.students.map((s) => [s.id, s]));

  const rows: MasterlistRow[] = [];
  for (const inst of instances) {
    const camp = campMap.get(inst.campId);
    if (!camp) continue;
    for (const studentId of inst.studentIds) {
      const student = studentMap.get(studentId);
      if (!student) continue;
      rows.push({ student, campName: camp.name });
    }
  }

  rows.sort((a, b) => {
    const primary = studentSortCompare(a.student, b.student);
    if (primary !== 0) return primary;
    return a.campName.localeCompare(b.campName);
  });

  return rows;
}

const COLUMNS: { header: string; width: number }[] = [
  { header: 'Last name', width: 14 },
  { header: ' First name', width: 13.55 },
  { header: 'Gender', width: 10.55 },
  { header: 'Age', width: 8.11 },
  { header: 'Session name', width: 32.22 },
  { header: 'Pre', width: 7.44 },
  { header: 'Post', width: 7.44 },
  { header: 'Special Request', width: 20 },
  { header: 'Medical Issues', width: 20 },
  { header: 'Photo', width: 9.33 },
  { header: 'Primary Name', width: 20 },
  { header: 'Primary Home phone #', width: 23.11 },
  { header: 'Primary Cell phone #', width: 20 },
  { header: 'Secondary Name', width: 20 },
  { header: 'Secondary Cell phone #', width: 25.33 },
  { header: 'Emergency contact name', width: 20 },
  { header: 'Emergency contact phone #', width: 26.33 },
  { header: 'Custody', width: 10.66 },
];

const PHOTO_COLUMN = 10;

export async function exportPrintableMasterlist(
  data: ScheduleData,
  instances: CampInstance[]
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Summer Camp Schedules';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Printable Masterlist');

  sheet.columns = COLUMNS.map((c) => ({
    header: c.header,
    width: c.width,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Calibri', size: 12, bold: true };

  const rows = buildMasterlistRows(data, instances);

  for (const { student, campName } of rows) {
    const row = sheet.addRow([
      student.lastName,
      student.firstName,
      student.gender,
      student.age,
      campName,
      yesOrBlank(student.preCamp),
      yesOrBlank(student.postCamp),
      student.specialRequest,
      student.medicalIssues,
      yesOrNo(student.photo),
      student.primary.name,
      student.primary.homePhone,
      student.primary.cellPhone,
      student.secondary.name,
      getSecondaryCellPhone(student),
      student.emergency.name,
      getEmergencyPhone(student),
      student.custody,
    ]);
    row.font = { name: 'Calibri', size: 12 };
    if (!student.photo) {
      applyCellFill(row.getCell(PHOTO_COLUMN), YELLOW_FILL);
    }
  }

  await saveWorkbook(workbook, 'Printable Masterlist.xlsx');
}
