const NEGATIVE_RESPONSES = new Set([
  'no',
  'n',
  'none',
  'n/a',
  'na',
  'not applicable',
  'nothing',
  'nope',
  '-',
  'none known',
]);

export function normalizeNegativeResponses(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:—-]+$/g, '');
  if (NEGATIVE_RESPONSES.has(normalized) || normalized === '') {
    return '';
  }
  return value;
}
