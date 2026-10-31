import { cn } from '@/lib/cn';
import { STATUS_DOT_CLASSES, STATUS_LABELS } from '../constants';
import type { ShipmentStatus } from '../types';

type ShipmentStatusBadgeProps = { status: ShipmentStatus };

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2 py-0.5 text-tiny font-light text-fg">
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', STATUS_DOT_CLASSES[status])}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
