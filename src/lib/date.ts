const pad = (value: number) => String(value).padStart(2, '0');

/** Clave de día en hora local, con formato "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isoToDateKey(iso: string): string {
  return toDateKey(new Date(iso));
}

/** Convierte una clave "YYYY-MM-DD" en una fecha local a las 00:00. */
export function parseDateKey(key: string): Date {
  const [year = 0, month = 1, day = 1] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Devuelve el día que está `days` días después de `base`, a la hora local indicada. */
export function atDayOffset(base: Date, days: number, hours: number, minutes = 0): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Suma meses conservando el día cuando existe; si no, usa el último día del mes. */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Semanas completas (domingo a sábado) que cubren el mes de `date`. */
export function getCalendarWeeks(date: Date): Date[][] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const start = addDays(firstOfMonth, -firstOfMonth.getDay());
  const end = addDays(lastOfMonth, 6 - lastOfMonth.getDay());

  const weeks: Date[][] = [];
  for (let day = start; day <= end; day = addDays(day, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(day, index)));
  }
  return weeks;
}
