import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  placeholder: string;
};

/** Select nativo con el estilo del input del kit. Compatible con `register` de React Hook Form. */
export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-[38px] w-full appearance-none rounded-full border border-line bg-surface pr-10 pl-4 text-input font-normal text-fg aria-invalid:border-status-cancelled',
          className,
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}
