type FormErrorProps = { message?: string };

/** Error general del formulario (por ejemplo, una falla al guardar). */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-status-cancelled/40 bg-status-cancelled/10 px-3 py-2 text-tiny font-light text-fg"
    >
      {message}
    </p>
  );
}
