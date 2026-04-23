import ExcelJS from 'exceljs';
import type { ScheduleData, GeneratedSchedule } from '@/models/types';

export async function exportScheduleToExcel(
  data: ScheduleData,
  schedule: GeneratedSchedule
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Summer Camp Schedules';
  workbook.created = new Date();

  const campMap = new Map(data.camps.map((c) => [c.id, c]));
  const studentMap = new Map(data.students.map((s) => [s.id, s]));

  const instancesByCamp = schedule.instances.reduce<
    Record<string, typeof schedule.instances>
  >((acc, inst) => {
    (acc[inst.campId] ??= []).push(inst);
    return acc;
  }, {});

  for (const [campId, instances] of Object.entries(instancesByCamp)) {
    const camp = campMap.get(campId);
    const sheetName = camp ? camp.name.slice(0, 31) : campId.slice(0, 31);
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = [
      { header: 'Student Name', key: 'name', width: 28 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Security Code', key: 'securityCode', width: 16 },
      { header: 'Instance #', key: 'instance', width: 12 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const sortedInstances = [...instances].sort(
      (a, b) => a.instanceNumber - b.instanceNumber
    );

    for (const inst of sortedInstances) {
      for (const studentId of inst.studentIds) {
        const student = studentMap.get(studentId);
        if (!student) continue;
        sheet.addRow({
          name: `${student.firstName} ${student.lastName}`,
          gender: student.gender,
          securityCode: student.safetyCode,
          instance: inst.instanceNumber,
        });
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'summer-camp-schedule.xlsx';
  anchor.click();
  URL.revokeObjectURL(url);
}
