import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line px-6 py-10 text-center">
      <p className="text-small font-semibold text-fg">{title}</p>
      {description && <p className="text-tiny font-light text-fg-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
