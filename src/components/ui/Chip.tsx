import { Icon } from './Icon';

type ChipProps = {
  label: string;
  onRemove: () => void;
};

/** Chip removible para mostrar un filtro aplicado. */
export function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-line bg-surface pr-1 pl-2.5 text-tiny font-light text-fg">
      <span className="truncate">{label}</span>
      <button
        type="button"
        data-chip-remove
        aria-label={`Quitar filtro ${label}`}
        onClick={onRemove}
        className="flex size-4 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface-raised hover:text-fg"
      >
        <Icon name="x" size={12} />
      </button>
    </span>
  );
}
