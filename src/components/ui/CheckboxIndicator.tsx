import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type CheckboxIndicatorProps = {
  checked: boolean;
  className?: string;
};

/** Checkbox visual del kit. El estado accesible lo expone el elemento que lo contiene. */
export function CheckboxIndicator({ checked, className }: CheckboxIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative size-4 shrink-0 rounded-xs border border-line',
        checked ? 'bg-primary text-bg' : 'bg-bg',
        className,
      )}
    >
      {checked && <Icon name="check" className="absolute -inset-px" />}
    </span>
  );
}
