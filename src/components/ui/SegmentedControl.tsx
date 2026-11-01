import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

type SegmentedControlProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * Grupo de opciones excluyentes con el patrón radiogroup: Tab entra a la opción elegida y las
 * flechas (o Home/End) cambian la selección.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = ARROW_STEPS[event.key];
    let next: number;
    if (step !== undefined) next = (index + step + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else return;

    event.preventDefault();
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    buttonRefs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex rounded-full border border-line bg-surface p-0.5', className)}
    >
      {options.map((option, index) => {
        const checked = index === selectedIndex;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => {
              onChange(option.value);
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index);
            }}
            className={cn(
              'h-7 rounded-full px-3 text-tiny font-semibold transition-colors',
              checked ? 'bg-surface-raised text-fg' : 'text-fg-soft hover:text-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
