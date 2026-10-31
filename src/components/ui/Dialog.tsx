import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

type DialogProps = {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

/** Modal sobre `<dialog>` nativo: atrapa el foco, cierra con Escape y devuelve el foco al cerrar. */
export function Dialog({ title, description, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-fg shadow-elevation-2 backdrop:bg-bg-deep/70"
    >
      <div className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="text-body-loose font-semibold">
              {title}
            </h2>
            {description}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="shrink-0 rounded-xs text-fg-muted hover:text-fg"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
