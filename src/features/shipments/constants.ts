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
