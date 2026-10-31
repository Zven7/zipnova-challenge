import { cn } from '@/lib/cn';
import { STATUS_DOT_CLASSES, STATUS_LABELS } from '../constants';
import { SHIPMENT_STATUSES } from '../types';

export function MapLegend() {
  return (
    <section
      aria-label="Referencias del mapa"
      className="rounded-lg border border-line bg-surface/95 px-3 py-2 shadow-elevation-1"
    >
      <h2 className="mb-1.5 text-tiny-loose font-semibold text-fg">Estado del envío</h2>
      <ul className="flex flex-col gap-1">
        {SHIPMENT_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-2 text-tiny font-light text-fg-soft">
            <span
              aria-hidden="true"
              className={cn('size-2.5 rounded-full border border-bg', STATUS_DOT_CLASSES[status])}
            />
            {STATUS_LABELS[status]}
          </li>
        ))}
      </ul>
    </section>
  );
}
