export function normalizeNegativeResponses(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'no' || trimmed === 'n' || trimmed === 'none' || trimmed === 'n/a') {
    return '';
  }
  return value;
}
