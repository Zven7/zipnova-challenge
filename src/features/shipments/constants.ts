import type { Priority, ShipmentStatus } from './types';

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: 'Pendiente',
  assigned: 'Asignado',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

/** Colores de estado compartidos por la lista, el mapa y la leyenda. */
export const STATUS_DOT_CLASSES: Record<ShipmentStatus, string> = {
  pending: 'bg-status-pending',
  assigned: 'bg-status-assigned',
  in_transit: 'bg-status-in-transit',
  delivered: 'bg-status-delivered',
  cancelled: 'bg-status-cancelled',
};
