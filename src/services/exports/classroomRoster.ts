import type { CampInstance, ScheduleData, Student } from '@/models/types';
import {
  GRAY_CLASSROOM_FILL,
  YELLOW_FILL,
  applyCellBorders,
  applyCellFill,
  buildInstancesGroupedByCamp,
  getInstanceSheetName,
  saveWorkbook,
  studentSortCompare,
  yesOrBlank,
  yesOrNo,
} from './shared';

const COLUMNS: { header: string; width?: number }[] = [
  { header: 'Last name', width: 17.9 },
  { header: 'First name', width: 17.9 },
  { header: 'Outdoor', width: 14.2 },
  { header: 'Lunch', width: 10.7 },
  { header: 'Dismissal', width: 15.9 },
  { header: 'Info', width: 18.1 },
  { header: 'Picture', width: 14.9 },
  { header: 'Pre', width: 12 },
  { header: 'Post', width: 12 },
];

const GRAY_COLUMN_INDICES = [3, 4, 5, 6, 7, 8, 9]; // C–I
const PICTURE_COLUMN = 7;

export async function exportClassroomRoster(
  data: ScheduleData,
  instances: CampInstance[]
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Summer Camp Schedules';
  workbook.created = new Date();

  const studentMap = new Map(data.students.map((s) => [s.id, s]));
  const campMap = new Map(data.camps.map((c) => [c.id, c]));
  const grouped = buildInstancesGroupedByCamp(instances);
  const usedSheetNames = new Set<string>();

  const sortedCampIds = Array.from(grouped.keys()).sort((a, b) =>
    (campMap.get(a)?.name ?? '').localeCompare(campMap.get(b)?.name ?? '')
  );

  for (const campId of sortedCampIds) {
    const camp = campMap.get(campId);
    if (!camp) continue;
    const campInstances = grouped.get(campId)!;
    const total = campInstances.length;

    for (const inst of campInstances) {
      const sheetName = getInstanceSheetName(
        camp.name,
        inst.instanceNumber,
        total,
        usedSheetNames
      );
      const sheet = workbook.addWorksheet(sheetName);

      sheet.columns = COLUMNS.map((c) => ({ width: c.width }));

      const title =
        total > 1 ? `${camp.name} ${inst.instanceNumber}` : camp.name;
      const titleRow = sheet.getRow(1);
      titleRow.getCell(1).value = title;
      titleRow.getCell(1).font = { name: 'Arial', size: 20, bold: true };
      titleRow.height = 28;

      // Row 2 intentionally blank

      const headerRow = sheet.getRow(3);
      COLUMNS.forEach((c, i) => {
        headerRow.getCell(i + 1).value = c.header;
        applyCellBorders(headerRow.getCell(i + 1));
      });
      headerRow.font = { name: 'Arial', size: 18, bold: true };
      headerRow.height = 32;
      for (const colIdx of GRAY_COLUMN_INDICES) {
        applyCellFill(headerRow.getCell(colIdx), GRAY_CLASSROOM_FILL);
      }

      const students: Student[] = inst.studentIds
        .map((id) => studentMap.get(id))
        .filter((s): s is Student => s !== undefined)
        .sort(studentSortCompare);

      students.forEach((student, i) => {
        const row = sheet.getRow(4 + i);
        row.height = 28;
        const maxColumn = COLUMNS.length;
        for (const colIdx of [...Array(maxColumn).keys()].map((i) => i + 1)) {
          applyCellBorders(row.getCell(colIdx));
        }

        row.getCell(1).value = student.lastName;
        row.getCell(2).value = student.firstName;
        row.getCell(3).value = '';
        row.getCell(4).value = '';
        row.getCell(5).value = '';
        row.getCell(6).value = '';
        row.getCell(7).value = yesOrNo(student.photo);
        row.getCell(8).value = yesOrBlank(student.preCamp);
        row.getCell(9).value = yesOrBlank(student.postCamp);

        row.font = { name: 'Arial', size: 14 };

        for (const colIdx of GRAY_COLUMN_INDICES) {
          applyCellFill(row.getCell(colIdx), GRAY_CLASSROOM_FILL);
        }
        if (!student.photo) {
          applyCellFill(row.getCell(PICTURE_COLUMN), YELLOW_FILL);
        }
      });
    }
  }

  await saveWorkbook(workbook, 'Classroom Roster.xlsx');
}
