import { isoToDateKey } from '@/lib/date';
import { includesText } from '@/lib/text';
import type { Shipment, ShipmentFilters } from '../types';

export const emptyFilters: ShipmentFilters = {
  query: '',
  statuses: [],
  priorities: [],
  driverIds: [],
  addressQuery: '',
};

function matchesQuery(shipment: Shipment, query: string): boolean {
  const searchable = [
    shipment.id,
    shipment.trackingNumber,
    shipment.customer,
    shipment.destination.address,
  ];
  return searchable.some((field) => includesText(field, query));
}

/** Un filtro de lista vacío no restringe nada; varios valores se combinan con "o". */
function matchesAny<T>(selected: T[], value: T | undefined): boolean {
  return selected.length === 0 || (value !== undefined && selected.includes(value));
}

export function matchesFilters(shipment: Shipment, filters: ShipmentFilters): boolean {
  return (
    matchesQuery(shipment, filters.query) &&
    matchesAny(filters.statuses, shipment.status) &&
    matchesAny(filters.priorities, shipment.priority) &&
    matchesAny(filters.driverIds, shipment.driverId) &&
    includesText(shipment.destination.address, filters.addressQuery) &&
    (filters.date === undefined || isoToDateKey(shipment.estimatedDelivery) === filters.date)
  );
}

export function filterShipments(shipments: Shipment[], filters: ShipmentFilters): Shipment[] {
  return shipments.filter((shipment) => matchesFilters(shipment, filters));
}

export function hasActiveFilters(filters: ShipmentFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.driverIds.length > 0 ||
    filters.addressQuery.trim() !== '' ||
    filters.date !== undefined
  );
}
