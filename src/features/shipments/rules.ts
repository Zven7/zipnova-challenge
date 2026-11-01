import type { Driver } from '@/features/drivers/types';
import type { Vehicle } from '@/features/vehicles/types';
import { isoToDateKey, toDateKey } from '@/lib/date';
import type { Shipment, ShipmentStatus } from './types';

// Lo usan el schema del formulario y los thunks; vive acá para que el store no dependa de Zod.
export const VEHICLE_BUSY_MESSAGE = 'Ese vehículo está en tránsito con otro envío.';
export const DRIVER_ON_ROUTE_MESSAGE =
  'Ese día el conductor ya salió con su vehículo y no puede sumar envíos.';
export const DISPATCH_TOO_EARLY_MESSAGE = 'Solo se puede despachar el día de la entrega.';

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

/** Un envío sale a reparto el día de su entrega (o después, si está atrasado), nunca antes. */
export function canDispatch(shipment: Shipment, today: Date): boolean {
  return isoToDateKey(shipment.estimatedDelivery) <= toDateKey(today);
}

/** Vehículos en tránsito con otro envío el mismo día que `shipment`. Los otros días están libres. */
export function getBusyVehicleIds(shipments: Shipment[], shipment: Shipment): string[] {
  const day = isoToDateKey(shipment.estimatedDelivery);
  return shipments.flatMap(({ id, status, vehicleId, estimatedDelivery }) =>
    id !== shipment.id &&
    status === 'in_transit' &&
    vehicleId !== undefined &&
    isoToDateKey(estimatedDelivery) === day
      ? [vehicleId]
      : [],
  );
}

export type Assignment = { driverId: string; vehicleId: string };

/** Por qué no se puede usar un par conductor–vehículo en un día. */
export type PairingConflict =
  | { kind: 'driver'; vehicleId: string } // el conductor ya usa otro vehículo ese día
  | { kind: 'vehicle'; driverId: string }; // el vehículo ya lo maneja otro conductor ese día

// Pendientes y cancelados no comprometen a nadie; los entregados sí (el conductor ya salió con ese vehículo).
const PAIRING_STATUSES: ShipmentStatus[] = ['assigned', 'in_transit', 'delivered'];

/** Conductor y vehículo de los otros envíos con entrega el mismo día que `shipment`. */
export function getSameDayAssignments(shipments: Shipment[], shipment: Shipment): Assignment[] {
  const day = isoToDateKey(shipment.estimatedDelivery);
  return shipments.flatMap(({ id, status, driverId, vehicleId, estimatedDelivery }) =>
    id !== shipment.id &&
    PAIRING_STATUSES.includes(status) &&
    driverId !== undefined &&
    vehicleId !== undefined &&
    isoToDateKey(estimatedDelivery) === day
      ? [{ driverId, vehicleId }]
      : [],
  );
}

/** En un mismo día, cada conductor usa un solo vehículo y cada vehículo tiene un solo conductor. */
export function getPairingConflict(
  assignment: Assignment,
  sameDay: Assignment[],
): PairingConflict | undefined {
  for (const other of sameDay) {
    if (other.driverId === assignment.driverId && other.vehicleId !== assignment.vehicleId) {
      return { kind: 'driver', vehicleId: other.vehicleId };
    }
    if (other.vehicleId === assignment.vehicleId && other.driverId !== assignment.driverId) {
      return { kind: 'vehicle', driverId: other.driverId };
    }
  }
  return undefined;
}

/** Vehículo que el conductor ya usa ese día, si tiene otros envíos. */
export function getDayVehicleId(driverId: string, sameDay: Assignment[]): string | undefined {
  return sameDay.find((other) => other.driverId === driverId)?.vehicleId;
}

/** El conductor ya salió ese día con su vehículo: no puede sumar envíos hasta volver. */
export function isDriverOnRoute(
  driverId: string,
  sameDay: Assignment[],
  busyVehicleIds: string[],
): boolean {
  const dayVehicleId = getDayVehicleId(driverId, sameDay);
  return dayVehicleId !== undefined && busyVehicleIds.includes(dayVehicleId);
}

export function describePairingConflict(
  conflict: PairingConflict,
  drivers: Driver[],
  vehicles: Vehicle[],
): string {
  if (conflict.kind === 'driver') {
    const vehicle = vehicles.find(({ id }) => id === conflict.vehicleId);
    const vehicleLabel = vehicle ? `${vehicle.model} (${vehicle.plate})` : 'otro vehículo';
    return `Ese día el conductor ya usa ${vehicleLabel}.`;
  }
  const driverName = drivers.find(({ id }) => id === conflict.driverId)?.name ?? 'otro conductor';
  return `Ese día el vehículo ya lo maneja ${driverName}.`;
}
