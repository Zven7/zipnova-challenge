import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-20 w-full resize-y rounded-lg border border-line bg-surface px-4 py-2 text-input font-normal text-fg placeholder:text-fg-muted aria-invalid:border-status-cancelled',
        className,
      )}
      {...props}
    />
  );
}
