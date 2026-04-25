import dayjs from 'dayjs';

export function generateDefaultWeeks(): string[] {
  const weeks: string[] = [];
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Jan-Dec
  const years = [dayjs().year(), dayjs().year() + 1];

  for (const year of years) {
    for (const month of months) {
      const startDate = dayjs().year(year).month(month).date(1);
      const daysInMonth = startDate.daysInMonth();

      for (let day = 1; day <= daysInMonth; day++) {
        const current = startDate.date(day);
        if (current.day() === 1) {
          weeks.push(current.format('MMMM D'));
        }
      }
    }
  }

  return weeks.sort();
}
