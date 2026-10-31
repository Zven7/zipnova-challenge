import { describe, expect, it } from 'vitest';
import { shouldSimulateFailure } from './simulation';

describe('shouldSimulateFailure', () => {
  it('no falla sin el parámetro', () => {
    expect(shouldSimulateFailure('carga', '')).toBe(false);
  });

  it('falla solo en el tipo indicado', () => {
    expect(shouldSimulateFailure('carga', '?simular-error=carga')).toBe(true);
    expect(shouldSimulateFailure('acciones', '?simular-error=carga')).toBe(false);
  });

  it('sin valor, falla en todo', () => {
    expect(shouldSimulateFailure('carga', '?simular-error')).toBe(true);
    expect(shouldSimulateFailure('acciones', '?simular-error')).toBe(true);
  });
});
