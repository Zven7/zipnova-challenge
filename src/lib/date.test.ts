import { describe, expect, it } from 'vitest';
import {
  addMonths,
  atDayOffset,
  getCalendarWeeks,
  isoToDateKey,
  isSameMonth,
  parseDateKey,
  toDateKey,
} from './date';

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

describe('parseDateKey', () => {
  it('es la inversa de toDateKey', () => {
    expect(toDateKey(parseDateKey('2026-07-06'))).toBe('2026-07-06');
    expect(parseDateKey('2026-07-06').getHours()).toBe(0);
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

describe('addMonths', () => {
  it('conserva el día cuando existe en el mes destino', () => {
    expect(toDateKey(addMonths(new Date(2026, 6, 6), 1))).toBe('2026-08-06');
  });

  it('usa el último día si el mes destino es más corto', () => {
    expect(toDateKey(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
  });

  it('cruza el cambio de año', () => {
    expect(toDateKey(addMonths(new Date(2026, 0, 15), -1))).toBe('2025-12-15');
  });
});

describe('isSameMonth', () => {
  it('compara mes y año', () => {
    expect(isSameMonth(new Date(2026, 6, 1), new Date(2026, 6, 31))).toBe(true);
    expect(isSameMonth(new Date(2026, 6, 1), new Date(2025, 6, 1))).toBe(false);
  });
});

describe('getCalendarWeeks', () => {
  it('arma semanas de domingo a sábado como en el kit (julio 2026)', () => {
    const weeks = getCalendarWeeks(new Date(2026, 6, 6));
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks.at(0)?.at(0)?.getDate()).toBe(28);
    expect(weeks.at(0)?.at(0)?.getMonth()).toBe(5);
    expect(weeks.at(4)?.at(6)?.getDate()).toBe(1);
    expect(weeks.at(4)?.at(6)?.getMonth()).toBe(7);
  });

  it('usa seis semanas cuando el mes lo necesita (agosto 2026)', () => {
    const weeks = getCalendarWeeks(new Date(2026, 7, 1));
    expect(weeks).toHaveLength(6);
    expect(weeks.every((week) => week.at(0)?.getDay() === 0)).toBe(true);
  });
});
