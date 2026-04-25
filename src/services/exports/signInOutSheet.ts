import type { CampInstance, ScheduleData, Student } from '@/models/types';
import { GRAY_SIGNIN_FILL, applyCellBorders, applyCellFill, buildInstancesGroupedByCamp, getInstanceSheetName, saveWorkbook, studentSortCompare } from './shared';

const DAY_HEADERS = ['Mon', 'Mon', 'Tues', 'Tues', 'Wed', 'Wed', 'Thurs', 'Thurs', 'Fri', 'Fri'];
const SUB_HEADERS = ['In', 'Out', 'In', 'Out', 'In', 'Out', 'In', 'Out', 'In', 'Out'];
// Columns C=3 (Mon In), E=5 (Tues In), G=7 (Wed In), I=9 (Thurs In), K=11 (Fri In)
const TOTAL_COLUMNS = 12; // A..L

export async function exportSignInOutSheet(data: ScheduleData, instances: CampInstance[]): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Summer Camp Schedules';
  workbook.created = new Date();

  const studentMap = new Map(data.students.map((s) => [s.id, s]));
  const campMap = new Map(data.camps.map((c) => [c.id, c]));
  const grouped = buildInstancesGroupedByCamp(instances);
  const usedSheetNames = new Set<string>();

  const sortedCampIds = Array.from(grouped.keys()).sort((a, b) => (campMap.get(a)?.name ?? '').localeCompare(campMap.get(b)?.name ?? ''));

  for (const campId of sortedCampIds) {
    const camp = campMap.get(campId);
    if (!camp) continue;
    const campInstances = grouped.get(campId)!;
    const total = campInstances.length;

    for (const inst of campInstances) {
      const sheetName = getInstanceSheetName(camp.name, inst.instanceNumber, total, usedSheetNames);
      const sheet = workbook.addWorksheet(sheetName);

      sheet.getColumn(1).width = 18;
      sheet.getColumn(2).width = 18;
      for (let c = 3; c <= TOTAL_COLUMNS; c++) {
        sheet.getColumn(c).width = 8.6;
      }

      const title = total > 1 ? `${camp.name} ${inst.instanceNumber}` : camp.name;
      const titleRow = sheet.getRow(1);
      titleRow.getCell(1).value = title;
      titleRow.getCell(1).font = { name: 'Arial', size: 20, bold: true };
      titleRow.getCell(7).value = '***Time and Initial****';
      titleRow.getCell(7).font = { name: 'Arial', size: 14, bold: true };
      titleRow.height = 28;

      // Row 2 blank

      const headerRow = sheet.getRow(3);
      headerRow.getCell(1).value = 'Last name';
      headerRow.getCell(2).value = 'First name';
      DAY_HEADERS.forEach((h, i) => {
        headerRow.getCell(3 + i).value = h;
      });
      headerRow.font = { name: 'Calibri', size: 18, bold: true };
      headerRow.height = 28;
      for (const colIdx of [...Array(10).keys()].map((i) => 3 + i)) {
        if (colIdx % 2 === 1) {
          applyCellBorders(applyCellFill(headerRow.getCell(colIdx), GRAY_SIGNIN_FILL));
        } else {
          applyCellBorders(headerRow.getCell(colIdx));
        }
      }

      const subRow = sheet.getRow(4);
      SUB_HEADERS.forEach((h, i) => {
        subRow.getCell(3 + i).value = h;
      });
      subRow.font = { name: 'Calibri', size: 18, bold: true };
      subRow.height = 28;
      for (const colIdx of [...Array(10).keys()].map((i) => 3 + i)) {
        if (colIdx % 2 === 1) {
          applyCellFill(subRow.getCell(colIdx), GRAY_SIGNIN_FILL);
        } else {
          applyCellBorders(subRow.getCell(colIdx));
        }
      }

      // Merge Last name / First name across rows 3-4 AFTER writing values.
      sheet.mergeCells('A3:A4');
      sheet.mergeCells('B3:B4');

      const students: Student[] = inst.studentIds
        .map((id) => studentMap.get(id))
        .filter((s): s is Student => s !== undefined)
        .sort(studentSortCompare);

      students.forEach((student, i) => {
        const row = sheet.getRow(5 + i);
        row.height = 32;
        row.getCell(1).value = student.lastName;
        row.getCell(2).value = student.firstName;
        applyCellBorders(row.getCell(1));
        applyCellBorders(row.getCell(2));

        row.font = { name: 'Calibri', size: 18 };
        for (const colIdx of [...Array(10).keys()].map((i) => 3 + i)) {
          if (colIdx % 2 === 1) {
            applyCellBorders(applyCellFill(row.getCell(colIdx), GRAY_SIGNIN_FILL));
          } else {
            applyCellBorders(row.getCell(colIdx));
          }
        }
      });
    }
  }

  await saveWorkbook(workbook, 'Sign In and Sign Out.xlsx');
}
