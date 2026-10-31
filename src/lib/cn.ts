/** Une clases de Tailwind ignorando los valores falsos. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
