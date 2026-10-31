import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { cn } from '@/lib/cn';
import { dismissToast, type Toast } from './toastsSlice';

const AUTO_DISMISS_MS = 4000;

export function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timeout = setTimeout(() => dispatch(dismissToast(toast.id)), AUTO_DISMISS_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [dispatch, toast.id]);

  const Icon = toast.tone === 'success' ? CircleCheck : CircleAlert;

  return (
    <li
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 shadow-elevation-2"
    >
      <Icon
        aria-hidden="true"
        size={16}
        className={cn(
          'mt-px shrink-0',
          toast.tone === 'success' ? 'text-primary' : 'text-status-cancelled',
        )}
      />
      <p className="flex-1 text-small font-light text-fg">{toast.message}</p>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="shrink-0 rounded-xs text-fg-muted hover:text-fg"
      >
        <X aria-hidden="true" size={14} />
      </button>
    </li>
  );
}
