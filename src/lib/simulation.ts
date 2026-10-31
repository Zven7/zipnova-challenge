export type SimulatedFailure = 'carga' | 'acciones';

/**
 * Fuerza errores del "backend" simulado para ver los estados de error:
 * `?simular-error=carga`, `?simular-error=acciones` o `?simular-error` (ambos).
 */
export function shouldSimulateFailure(
  kind: SimulatedFailure,
  search: string = window.location.search,
): boolean {
  const value = new URLSearchParams(search).get('simular-error');
  return value === kind || value === '';
}
