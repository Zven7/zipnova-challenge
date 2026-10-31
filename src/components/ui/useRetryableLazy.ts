import { lazy, useState, type ComponentType } from 'react';

/**
 * Como `lazy`, pero permite reintentar: `lazy` recuerda la promesa rechazada, así que después de
 * una descarga fallida hace falta crear otro componente diferido.
 */
export function useRetryableLazy<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
) {
  const [Component, setComponent] = useState(() => lazy(load));

  function retry() {
    setComponent(() => lazy(load));
  }

  return [Component, retry] as const;
}
