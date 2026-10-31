import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useAppDispatch } from '@/app/hooks';
import { showToast } from '@/features/notifications/toastsSlice';

const FALLBACK_ERROR = 'No pudimos guardar el cambio. Intenta de nuevo.';

/**
 * Ejecuta una acción y da feedback: toast de éxito y cierre, o error visible en el formulario.
 * Los thunks rechazan con un mensaje (string) cuando falla una regla o la "red".
 */
export function useActionFeedback<T extends FieldValues>(
  setError: UseFormSetError<T>,
  onDone: () => void,
) {
  const dispatch = useAppDispatch();

  return async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      dispatch(showToast({ tone: 'success', message: successMessage }));
      onDone();
    } catch (error) {
      setError('root', { message: typeof error === 'string' ? error : FALLBACK_ERROR });
    }
  };
}
