import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const variants = {
  primary:
    'bg-primary text-bg hover:bg-primary-alt disabled:bg-surface-hover disabled:text-fg-muted',
  secondary: 'border border-line bg-surface text-fg hover:bg-surface-raised disabled:text-fg-muted',
  ghost: 'text-fg-soft hover:bg-surface-raised hover:text-fg disabled:text-fg-faint',
};

/** Botón con los tokens del kit (el kit no incluye un botón; usa la forma de píldora del input). */
export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-small font-semibold transition-colors disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
