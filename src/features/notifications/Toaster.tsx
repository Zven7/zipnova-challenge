import { useAppSelector } from '@/app/hooks';
import { ToastItem } from './ToastItem';

export function Toaster() {
  const toasts = useAppSelector((state) => state.toasts);
  return (
    <ol
      aria-label="Notificaciones"
      className="pointer-events-none fixed right-4 bottom-4 z-[2000] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 [&>li]:pointer-events-auto"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </ol>
  );
}
