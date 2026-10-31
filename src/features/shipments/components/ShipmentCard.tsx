import type { Ref } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/iconData';
import { cn } from '@/lib/cn';
import { formatCompactCurrency, formatDelivery, formatVolume, formatWeight } from '@/lib/format';
import { PRIORITY_LABELS } from '../constants';
import {
  selectIsExpanded,
  selectSelectedShipmentId,
  selectShipmentDetails,
} from '../store/selectors';
import { selectShipment, toggleExpanded } from '../store/shipmentsViewSlice';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

type ShipmentCardProps = {
  id: string;
  /** Se llama después de seleccionar con "ubicar" (en mobile cambia a la pestaña del mapa). */
  onLocate: () => void;
  onOpenActions: (id: string) => void;
  ref?: Ref<HTMLElement>;
};

/** Card de envío del kit: colapsada (número y ubicar) y expandida (métricas, paquetes y asignación). */
export function ShipmentCard({ id, onLocate, onOpenActions, ref }: ShipmentCardProps) {
  const dispatch = useAppDispatch();
  const details = useAppSelector((state) => selectShipmentDetails(state, id));
  const expanded = useAppSelector((state) => selectIsExpanded(state, id));
  const selected = useAppSelector((state) => selectSelectedShipmentId(state) === id);

  if (!details) return null;
  const { shipment, metrics, driver, vehicle } = details;
  const titleId = `shipment-${id}-title`;
  const bodyId = `shipment-${id}-body`;

  const metricItems: { icon: IconName; label: string; value: string }[] = [
    { icon: 'weight', label: 'Peso', value: formatWeight(metrics.weightKg) },
    { icon: 'volume', label: 'Volumen', value: formatVolume(metrics.volumeM3) },
    { icon: 'box', label: 'Bultos', value: String(metrics.packageCount) },
    { icon: 'cash', label: 'Valor declarado', value: formatCompactCurrency(metrics.value) },
  ];

  const assignment =
    driver && vehicle ? `${driver.name} · ${vehicle.model} ${vehicle.plate}` : 'Sin asignar';

  return (
    <article
      ref={ref}
      aria-labelledby={titleId}
      className={cn(
        'overflow-hidden rounded-md bg-surface-raised',
        selected && 'outline-1 outline-primary',
      )}
    >
      <div className="flex items-center justify-between gap-4 p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={titleId} className="text-small font-semibold text-fg">
            Entrega {shipment.id}
          </h2>
          <p className="text-tiny leading-[14px] font-light text-fg">{shipment.trackingNumber}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={`Ubicar la entrega ${shipment.id} en el mapa`}
            aria-pressed={selected}
            onClick={() => {
              dispatch(selectShipment(id));
              onLocate();
            }}
            className="rounded-xs text-primary"
          >
            <Icon name="locate-fixed" />
          </button>
          <button
            type="button"
            aria-label={expanded ? 'Ocultar detalle' : 'Ver detalle'}
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => {
              dispatch(toggleExpanded(id));
            }}
            className="rounded-xs text-fg-muted"
          >
            <Icon
              name="caret-down"
              className={cn('transition-transform', expanded && 'rotate-180')}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div id={bodyId} className="flex flex-col gap-2 bg-surface px-3 pt-2 pb-3">
          <dl className="flex items-center justify-between gap-4 py-1">
            {metricItems.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  'flex flex-1 items-center',
                  index === 0 ? 'justify-start' : 'justify-center',
                )}
              >
                <dt className="sr-only">{item.label}</dt>
                <dd className="flex items-center gap-1 text-tiny font-light text-fg">
                  <Icon name={item.icon} size={8} />
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <hr className="border-line" />

          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-tiny font-light">
            <dt className="text-fg-muted">Cliente</dt>
            <dd className="text-fg">{shipment.customer}</dd>
            <dt className="text-fg-muted">Destino</dt>
            <dd className="text-fg">{shipment.destination.address}</dd>
            <dt className="text-fg-muted">Entrega estimada</dt>
            <dd className="text-fg">{formatDelivery(shipment.estimatedDelivery)}</dd>
            <dt className="text-fg-muted">Estado</dt>
            <dd className="flex flex-wrap items-center gap-2 text-fg">
              <ShipmentStatusBadge status={shipment.status} />
              <span>Prioridad {PRIORITY_LABELS[shipment.priority].toLowerCase()}</span>
            </dd>
            {shipment.cancellationReason && (
              <>
                <dt className="text-fg-muted">Motivo</dt>
                <dd className="text-fg">{shipment.cancellationReason}</dd>
              </>
            )}
          </dl>

          <hr className="border-line" />

          <ul className="flex flex-col gap-3" aria-label="Paquetes">
            {shipment.packages.map((item, index) => (
              <li
                key={item.code}
                className={cn('flex flex-col gap-2', index > 0 && 'border-t border-line pt-3')}
              >
                <p className="flex items-center gap-2 text-small font-semibold text-fg">
                  <Icon name="box" />
                  Paquete {index + 1}
                </p>
                <div className="flex items-center justify-between gap-4 rounded-sm bg-surface-raised p-2 text-tiny font-light text-fg">
                  <span>{item.code}</span>
                  <span>
                    {formatWeight(item.weightKg)}
                    <span aria-hidden="true" className="mx-1">
                      ⸱
                    </span>
                    {formatVolume(item.volumeM3)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-4">
            <p className="truncate text-tiny font-light text-fg">{assignment}</p>
            <button
              type="button"
              aria-label={`Acciones de la entrega ${shipment.id}`}
              onClick={() => {
                onOpenActions(id);
              }}
              className="shrink-0 rounded-xs text-primary-alt"
            >
              <Icon name="assign" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
