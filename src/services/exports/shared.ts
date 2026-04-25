import type { Cell, FillPattern, Workbook } from 'exceljs';
import type { CampInstance, Student } from '@/models/types';

export const YELLOW_FILL = 'FFFFFF00';
export const GRAY_CLASSROOM_FILL = 'FFF2F2F2';
export const GRAY_SIGNIN_FILL = 'FFD8D8D8';

const MAX_SHEET_NAME_LENGTH = 31;
const FORBIDDEN_SHEET_CHARS = /[\\/?*[\]:]/g;

export function sanitizeSheetName(raw: string): string {
  const cleaned = raw.replace(FORBIDDEN_SHEET_CHARS, '').replace(/\s+/g, ' ').trim();
  if (cleaned.length === 0) return 'Sheet';
  return cleaned.slice(0, MAX_SHEET_NAME_LENGTH);
}

export function getInstanceSheetName(campName: string, instanceNumber: number, totalInstancesForCamp: number, usedNames: Set<string>): string {
  const base = totalInstancesForCamp > 1 ? `${campName} ${instanceNumber}` : campName;
  const candidate = sanitizeSheetName(base);

  if (!usedNames.has(candidate)) {
    usedNames.add(candidate);
    return candidate;
  }

  for (let n = 2; n < 1000; n++) {
    const suffix = ` (${n})`;
    const trimmed = candidate.slice(0, MAX_SHEET_NAME_LENGTH - suffix.length);
    const next = `${trimmed}${suffix}`;
    if (!usedNames.has(next)) {
      usedNames.add(next);
      return next;
    }
  }

  const fallback = sanitizeSheetName(`${campName}-${instanceNumber}-${Date.now()}`);
  usedNames.add(fallback);
  return fallback;
}

export function studentSortCompare(a: Student, b: Student): number {
  const last = a.lastName.localeCompare(b.lastName, undefined, {
    sensitivity: 'base',
  });
  if (last !== 0) return last;
  return a.firstName.localeCompare(b.firstName, undefined, {
    sensitivity: 'base',
  });
}

export function firstNonEmpty(...values: string[]): string {
  for (const v of values) {
    if (v != null && v.trim().length > 0) return v;
  }
  return '';
}

export function getEmergencyPhone(s: Student): string {
  return firstNonEmpty(s.emergency.homePhone, s.emergency.cellPhone);
}

export function getSecondaryCellPhone(s: Student): string {
  return firstNonEmpty(s.secondary.cellPhone, s.secondary.homePhone);
}

export function yesOrBlank(b: boolean): string {
  return b ? 'Yes' : '';
}

export function yesOrNo(b: boolean): string {
  return b ? 'Yes' : 'No';
}

export function applyCellFill(cell: Cell, argb: string): Cell {
  const fill: FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb },
  };
  cell.fill = fill;
  return cell;
}

export function applyCellBorders(cell?: Cell) {
  if (!cell) return cell;
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  return cell;
}

export function buildInstancesGroupedByCamp(instances: CampInstance[]): Map<string, CampInstance[]> {
  const map = new Map<string, CampInstance[]>();
  for (const inst of instances) {
    const list = map.get(inst.campId) ?? [];
    list.push(inst);
    map.set(inst.campId, list);
  }
  for (const [campId, list] of map) {
    list.sort((a, b) => a.instanceNumber - b.instanceNumber);
    map.set(campId, list);
  }
  return map;
}

export async function saveWorkbook(workbook: Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
