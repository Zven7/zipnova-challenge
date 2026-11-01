import { useEffect, useRef } from 'react';
import { formatDelivery } from '@/lib/format';
import { PRIORITY_LABELS } from '../constants';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';
import type { Shipment } from '../types';

type ShipmentPopupProps = {
  shipment: Shipment;
  onShowInList: (id: string) => void;
  /** Enfoca "Ver en la lista" al abrirse (en mobile, donde la lista queda oculta). */
  autoFocus: boolean;
};

export function ShipmentPopup({ shipment, onShowInList, autoFocus }: ShipmentPopupProps) {
  const actionRef = useRef<HTMLButtonElement>(null);

  // react-leaflet monta el contenido al abrirse el popup. Sin preventScroll, el foco puede
  // desplazar el contenedor del mapa.
  useEffect(() => {
    if (autoFocus) actionRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <div className="flex w-56 flex-col gap-2">
      <div>
        <p className="text-small font-semibold text-fg">Entrega {shipment.id}</p>
        <p className="text-tiny font-light text-fg-soft">{shipment.customer}</p>
      </div>
      <p className="text-tiny font-light text-fg">{shipment.destination.address}</p>
      <div className="flex flex-wrap items-center gap-2 text-tiny font-light text-fg-soft">
        <ShipmentStatusBadge status={shipment.status} />
        <span>Prioridad {PRIORITY_LABELS[shipment.priority].toLowerCase()}</span>
      </div>
      <p className="text-tiny font-light text-fg-soft">
        Entrega estimada: {formatDelivery(shipment.estimatedDelivery)}
      </p>
      <button
        ref={actionRef}
        type="button"
        onClick={() => {
          onShowInList(shipment.id);
        }}
        className="self-start rounded-xs text-tiny font-semibold text-primary hover:underline"
      >
        Ver en la lista
      </button>
    </div>
  );
}
