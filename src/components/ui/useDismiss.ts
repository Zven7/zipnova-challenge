import { useEffect, type RefObject } from 'react';

/** Llama a `onDismiss` al hacer clic fuera de `ref` mientras `enabled` es true. */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) onDismiss();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [ref, onDismiss, enabled]);
}
