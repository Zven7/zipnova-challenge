import { describe, expect, it } from 'vitest';
import { includesText, normalizeText } from './text';

describe('normalizeText', () => {
  it('quita acentos, pasa a minúsculas y recorta espacios', () => {
    expect(normalizeText('  Av. Álvarez THOMAS ')).toBe('av. alvarez thomas');
  });

  it('conserva la ñ como n sin tilde', () => {
    expect(normalizeText('Ñuñoa')).toBe('nunoa');
  });
});

describe('includesText', () => {
  it('ignora mayúsculas y acentos', () => {
    expect(includesText('Martínez, Buenos Aires', 'martinez')).toBe(true);
  });

  it('una búsqueda vacía coincide con todo', () => {
    expect(includesText('Palermo', '   ')).toBe(true);
  });

  it('devuelve false cuando no hay coincidencia', () => {
    expect(includesText('Palermo', 'Belgrano')).toBe(false);
  });
});
