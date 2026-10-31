import type { Shipment, ShipmentStatus } from './types';

/** Flujo lineal: pending → assigned → in_transit → delivered. */
const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  pending: 'assigned',
  assigned: 'in_transit',
  in_transit: 'delivered',
};

export function getNextStatus(status: ShipmentStatus): ShipmentStatus | undefined {
  return NEXT_STATUS[status];
}

/** Se puede cancelar desde cualquier estado excepto entregado (o si ya está cancelado). */
export function canCancel(status: ShipmentStatus): boolean {
  return status !== 'delivered' && status !== 'cancelled';
}

export function canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return to === 'cancelled' ? canCancel(from) : getNextStatus(from) === to;
}

/** Asignar (pendiente) o reasignar (asignado). En tránsito ya no se cambia el vehículo. */
export function canAssign(status: ShipmentStatus): boolean {
  return status === 'pending' || status === 'assigned';
}

/** Vehículos ocupados por otro envío en tránsito. */
export function getBusyVehicleIds(shipments: Shipment[], excludeShipmentId?: string): string[] {
  return shipments
    .filter(
      (shipment) =>
        shipment.id !== excludeShipmentId &&
        shipment.status === 'in_transit' &&
        shipment.vehicleId !== undefined,
    )
    .map((shipment) => shipment.vehicleId)
    .filter((vehicleId): vehicleId is string => vehicleId !== undefined);
}
