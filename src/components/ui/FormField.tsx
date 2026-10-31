import type { ReactNode } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Recibe los atributos de accesibilidad para el control. */
  children: (control: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
};

/** Etiqueta + control + mensaje de error por campo, enlazados con aria-describedby. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-light text-fg">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error !== undefined,
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <p
          id={messageId}
          className={
            error
              ? 'text-tiny font-light text-status-cancelled'
              : 'text-tiny font-light text-fg-soft'
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
