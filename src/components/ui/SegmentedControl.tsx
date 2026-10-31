import { cn } from '@/lib/cn';

type SegmentedControlProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex rounded-full border border-line bg-surface p-0.5', className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => {
            onChange(option.value);
          }}
          className={cn(
            'h-7 rounded-full px-3 text-tiny font-semibold transition-colors',
            option.value === value ? 'bg-surface-raised text-fg' : 'text-fg-muted hover:text-fg',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
