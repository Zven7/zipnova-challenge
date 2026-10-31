import { describe, expect, it } from 'vitest';
import {
  formatCompactCurrency,
  formatDate,
  formatDelivery,
  formatVolume,
  formatWeight,
} from './format';

describe('formatWeight', () => {
  it('usa coma decimal y omite decimales innecesarios', () => {
    expect(formatWeight(60)).toBe('60 kg');
    expect(formatWeight(3.5)).toBe('3,5 kg');
  });
});

describe('formatVolume', () => {
  it('usa tres decimales como en el kit', () => {
    expect(formatVolume(0.2)).toBe('0,200 m3');
    expect(formatVolume(0.1 + 0.2)).toBe('0,300 m3');
  });
});

describe('formatCompactCurrency', () => {
  it.each([
    [950, '$ 950'],
    [230000, '$ 230 K'],
    [86500, '$ 87 K'],
    [1380000, '$ 1,4 M'],
  ])('formatea %d como "%s"', (value, expected) => {
    expect(formatCompactCurrency(value)).toBe(expected);
  });
});

describe('formatDelivery', () => {
  const now = new Date(2026, 9, 31, 8, 0);

  it('usa "Hoy", "Mañana" y "Ayer" para los días cercanos', () => {
    expect(formatDelivery(new Date(2026, 9, 31, 16, 0).toISOString(), now)).toBe('Hoy, 16:00');
    expect(formatDelivery(new Date(2026, 10, 1, 9, 30).toISOString(), now)).toBe('Mañana, 09:30');
    expect(formatDelivery(new Date(2026, 9, 30, 11, 0).toISOString(), now)).toBe('Ayer, 11:00');
  });

  it('usa día y mes para el resto', () => {
    expect(formatDelivery(new Date(2026, 10, 2, 10, 0).toISOString(), now)).toBe('02/11, 10:00');
  });
});

describe('formatDate', () => {
  it('rellena día y mes con ceros', () => {
    expect(formatDate(new Date(2026, 6, 6))).toBe('06/07/2026');
  });
});
