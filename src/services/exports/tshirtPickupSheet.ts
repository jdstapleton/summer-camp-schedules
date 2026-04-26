import type { CampInstance, ScheduleData, Student } from '@/models/types';
import { applyCellBorders, applyCellFill, buildInstancesGroupedByCamp, getInstanceSheetName, saveWorkbook, studentSortCompare } from './shared';

const GRAY_TSHIRT_FILL = 'FFF2F2F2';

export async function exportTshirtPickupSheet(data: ScheduleData, instances: CampInstance[]): Promise<void> {
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
      sheet.getColumn(3).width = 21;
      sheet.getColumn(4).width = 18;

      const title = total > 1 ? `${camp.name} ${inst.instanceNumber}` : camp.name;
      const titleRow = sheet.getRow(1);
      titleRow.getCell(1).value = title;
      titleRow.getCell(1).font = { name: 'Arial', size: 20, bold: true };
      titleRow.getCell(1).value = `${title} - T-Shirt Pickup`;
      titleRow.height = 28;

      const headerRow = sheet.getRow(3);
      headerRow.getCell(1).value = 'Last name';
      headerRow.getCell(2).value = 'First name';
      headerRow.getCell(3).value = 'T-Shirt Size';
      headerRow.getCell(4).value = 'Initials';
      headerRow.font = { name: 'Calibri', size: 18, bold: true };
      headerRow.height = 28;
      for (let colIdx = 1; colIdx <= 4; colIdx++) {
        applyCellBorders(applyCellFill(headerRow.getCell(colIdx), GRAY_TSHIRT_FILL));
      }

      const students: Student[] = inst.studentIds
        .map((id) => studentMap.get(id))
        .filter((s): s is Student => s !== undefined)
        .sort(studentSortCompare);

      students.forEach((student, i) => {
        const row = sheet.getRow(4 + i);
        row.height = 32;
        row.getCell(1).value = student.lastName;
        row.getCell(2).value = student.firstName;
        row.getCell(3).value = student.tshirtSize;
        row.getCell(4).value = '';

        row.font = { name: 'Calibri', size: 18 };
        for (let colIdx = 1; colIdx <= 4; colIdx++) {
          applyCellBorders(row.getCell(colIdx));
        }
      });
    }
  }

  await saveWorkbook(workbook, 'T-Shirt Pickup.xlsx');
}
