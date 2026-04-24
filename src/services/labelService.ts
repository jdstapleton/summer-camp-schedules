import type { ScheduleData, CampInstance } from '@/models/types';
import PRINT_CSS from './labelService.css?raw';

export function printLabels(
  data: ScheduleData,
  instances: CampInstance[]
): void {
  const campMap = new Map(data.camps.map((c) => [c.id, c]));
  const studentMap = new Map(data.students.map((s) => [s.id, s]));

  const sorted = [...instances].sort((a, b) => {
    const nameA = campMap.get(a.campId)?.name ?? '';
    const nameB = campMap.get(b.campId)?.name ?? '';
    return nameA.localeCompare(nameB) || a.instanceNumber - b.instanceNumber;
  });

  const instanceCountByCamp = new Map<string, number>();
  for (const inst of sorted) {
    instanceCountByCamp.set(
      inst.campId,
      (instanceCountByCamp.get(inst.campId) ?? 0) + 1
    );
  }

  const labels: { name: string; campLine: string }[] = [];
  for (const inst of sorted) {
    const campName = campMap.get(inst.campId)?.name ?? inst.campId;
    const multiInstance = (instanceCountByCamp.get(inst.campId) ?? 1) > 1;
    const campLine = multiInstance
      ? `${campName} ${inst.instanceNumber}`
      : campName;
    for (const studentId of inst.studentIds) {
      const student = studentMap.get(studentId);
      if (!student) continue;
      labels.push({
        name: `${student.firstName} ${student.lastName}`,
        campLine,
      });
    }
  }

  const win = window.open('', '_blank');
  if (!win) return;

  const doc = win.document;

  const meta = doc.createElement('meta');
  meta.setAttribute('charset', 'utf-8');
  doc.head.appendChild(meta);

  doc.title = 'Camp Labels';

  const style = doc.createElement('style');
  style.textContent = PRINT_CSS;
  doc.head.appendChild(style);

  const LABELS_PER_PAGE = 30;
  for (let i = 0; i < labels.length; i += LABELS_PER_PAGE) {
    const page = labels.slice(i, i + LABELS_PER_PAGE);
    const sheet = doc.createElement('div');
    sheet.className = 'sheet';

    for (const label of page) {
      const labelDiv = doc.createElement('div');
      labelDiv.className = 'label';

      const nameEl = doc.createElement('div');
      nameEl.className = 'name';
      nameEl.textContent = label.name;

      const campEl = doc.createElement('div');
      campEl.className = 'camp';
      campEl.textContent = label.campLine;

      labelDiv.append(nameEl, campEl);
      sheet.appendChild(labelDiv);
    }

    doc.body.appendChild(sheet);
  }

  win.addEventListener('load', () => {
    win.print();
    win.addEventListener('afterprint', () => win.close());
  });
}
