// Marca temporal para que la ñ sobreviva a la limpieza de diacríticos.
const ENYE_MARK = '\u0001';

/**
 * Pasa a minúsculas y quita acentos para comparar textos sin importar cómo se escribieron.
 * Con `keepEnye`, la ñ se conserva como letra propia en lugar de convertirse en n.
 */
export function normalizeText(value: string, keepEnye = false): string {
  const lower = value.normalize('NFC').toLowerCase();
  return (keepEnye ? lower.replaceAll('ñ', ENYE_MARK) : lower)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll(ENYE_MARK, 'ñ')
    .trim();
}

/**
 * Indica si `text` contiene `query`. Una búsqueda vacía coincide con todo. La ñ solo se distingue
 * de la n si quien busca la escribe: "ñ" encuentra "Peña", y "espana" sigue encontrando "España".
 */
export function includesText(text: string, query: string): boolean {
  const keepEnye = /ñ/i.test(query.normalize('NFC'));
  const normalizedQuery = normalizeText(query, keepEnye);
  return normalizedQuery === '' || normalizeText(text, keepEnye).includes(normalizedQuery);
}
