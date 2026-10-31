const pad = (value: number) => String(value).padStart(2, '0');

/** Clave de día en hora local, con formato "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isoToDateKey(iso: string): string {
  return toDateKey(new Date(iso));
}

/** Devuelve el día que está `days` días después de `base`, a la hora local indicada. */
export function atDayOffset(base: Date, days: number, hours: number, minutes = 0): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  result.setHours(hours, minutes, 0, 0);
  return result;
}
