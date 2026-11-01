import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { selectDriverEntities } from '@/features/drivers/store/selectors';
import { selectVehicleEntities } from '@/features/vehicles/store/selectors';
import { getShipmentMetrics } from '../metrics';
import { parseDateKey } from '@/lib/date';
import { formatDate } from '@/lib/format';
import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import { getBusyVehicleIds, getSameDayAssignments } from '../rules';
import type { ActiveFilterChip, Shipment } from '../types';
import { filterShipments, hasActiveFilters } from './filterShipments';
import { shipmentsAdapter } from './shipmentsSlice';

export const {
  selectAll: selectAllShipments,
  selectById: selectShipmentById,
  selectTotal: selectShipmentsTotal,
} = shipmentsAdapter.getSelectors((state: RootState) => state.shipments);

export const selectLoadStatus = (state: RootState) => state.shipments.loadStatus;
export const selectLoadError = (state: RootState) => state.shipments.loadError;

export const selectFilters = (state: RootState) => state.shipmentsView.filters;
export const selectSelectedShipmentId = (state: RootState) =>
  state.shipmentsView.selectedShipmentId;
export const selectSelectionSource = (state: RootState) => state.shipmentsView.selectionSource;
export const selectSelectionVersion = (state: RootState) => state.shipmentsView.selectionVersion;

/** Única fuente de verdad de lo visible: la lista y el mapa consumen este selector. */
export const selectFilteredShipments = createSelector(
  [selectAllShipments, selectFilters],
  filterShipments,
);

export const selectResultCount = createSelector(
  [selectFilteredShipments, selectShipmentsTotal],
  (visible, total) => ({ visible: visible.length, total }),
);

export const selectHasActiveFilters = createSelector([selectFilters], hasActiveFilters);

export const selectIsExpanded = (state: RootState, id: string) =>
  state.shipmentsView.expandedShipmentIds.includes(id);

export const selectFilteredShipmentIds = createSelector([selectFilteredShipments], (shipments) =>
  shipments.map((shipment) => shipment.id),
);

/** Datos de la card: el envío con sus métricas, conductor y vehículo resueltos. */
export const selectShipmentDetails = createSelector(
  [selectShipmentById, selectDriverEntities, selectVehicleEntities],
  (shipment: Shipment | undefined, drivers, vehicles) =>
    shipment && {
      shipment,
      metrics: getShipmentMetrics(shipment),
      driver: shipment.driverId ? drivers[shipment.driverId] : undefined,
      vehicle: shipment.vehicleId ? vehicles[shipment.vehicleId] : undefined,
    },
);

/** Direcciones únicas de todos los envíos, para las sugerencias del filtro "Dirección". */
export const selectAddressSuggestions = createSelector([selectAllShipments], (shipments) =>
  [...new Set(shipments.map((shipment) => shipment.destination.address))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  ),
);

/** Chips de los filtros activos con su etiqueta resuelta. La búsqueda libre ya se ve en su input. */
export const selectActiveFilterChips = createSelector(
  [selectFilters, selectDriverEntities],
  (filters, drivers): ActiveFilterChip[] => [
    ...filters.statuses.map((value) => ({
      key: `status-${value}`,
      label: `Estado: ${STATUS_LABELS[value]}`,
      filter: { kind: 'status' as const, value },
    })),
    ...filters.priorities.map((value) => ({
      key: `priority-${value}`,
      label: `Prioridad: ${PRIORITY_LABELS[value]}`,
      filter: { kind: 'priority' as const, value },
    })),
    ...filters.driverIds.map((value) => ({
      key: `driver-${value}`,
      label: `Conductor: ${drivers[value]?.name ?? value}`,
      filter: { kind: 'driver' as const, value },
    })),
    ...(filters.addressQuery.trim()
      ? [
          {
            key: 'address',
            label: `Dirección: ${filters.addressQuery.trim()}`,
            filter: { kind: 'address' as const },
          },
        ]
      : []),
    ...(filters.date
      ? [
          {
            key: 'date',
            label: `Fecha: ${formatDate(parseDateKey(filters.date))}`,
            filter: { kind: 'date' as const },
          },
        ]
      : []),
  ],
);

/** Vehículos en tránsito con otro envío el mismo día: no se pueden asignar a `shipmentId`. */
export const selectBusyVehicleIds = createSelector(
  [
    selectAllShipments,
    (state: RootState, shipmentId: string) => selectShipmentById(state, shipmentId),
  ],
  (shipments, shipment) => (shipment ? getBusyVehicleIds(shipments, shipment) : []),
);

/** Pares conductor–vehículo de los otros envíos del mismo día que `shipmentId`. */
export const selectSameDayAssignments = createSelector(
  [
    selectAllShipments,
    (state: RootState, shipmentId: string) => selectShipmentById(state, shipmentId),
  ],
  (shipments, shipment) => (shipment ? getSameDayAssignments(shipments, shipment) : []),
);
