/** Pasa a minúsculas y quita acentos para comparar textos sin importar cómo se escribieron. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Indica si `text` contiene `query`. Una búsqueda vacía coincide con todo. */
export function includesText(text: string, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  return normalizedQuery === '' || normalizeText(text).includes(normalizedQuery);
}
