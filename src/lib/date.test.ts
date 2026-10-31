import { describe, expect, it } from 'vitest';
import { atDayOffset, isoToDateKey, toDateKey } from './date';

describe('toDateKey', () => {
  it('formatea en hora local con ceros a la izquierda', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('isoToDateKey', () => {
  it('usa el día local de la fecha ISO', () => {
    const date = new Date(2026, 6, 6, 10, 30);
    expect(isoToDateKey(date.toISOString())).toBe('2026-07-06');
  });
});

describe('atDayOffset', () => {
  const base = new Date(2026, 9, 31, 15, 45, 12);

  it('suma días y fija la hora local', () => {
    const result = atDayOffset(base, 2, 9, 30);
    expect(toDateKey(result)).toBe('2026-11-02');
    expect([result.getHours(), result.getMinutes(), result.getSeconds()]).toEqual([9, 30, 0]);
  });

  it('acepta desfases negativos', () => {
    expect(toDateKey(atDayOffset(base, -31, 12))).toBe('2026-09-30');
  });

  it('no modifica la fecha base', () => {
    atDayOffset(base, 5, 8);
    expect(base.getDate()).toBe(31);
  });
});
