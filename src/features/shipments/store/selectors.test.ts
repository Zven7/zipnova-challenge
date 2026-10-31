import { describe, expect, it } from 'vitest';
import { setupStore } from '@/app/store';
import { mockDrivers } from '@/features/drivers/mock';
import { mockVehicles } from '@/features/vehicles/mock';
import { createMockShipments } from '../mock';
import {
  selectFilteredShipments,
  selectHasActiveFilters,
  selectIsExpanded,
  selectResultCount,
} from './selectors';
import { clearFilters, focusShipment, setStatuses, toggleExpanded } from './shipmentsViewSlice';
import { fetchOperationData } from './thunks';

function loadedStore() {
  const store = setupStore();
  const data = {
    shipments: createMockShipments(new Date(2026, 9, 31, 8, 0)),
    drivers: mockDrivers,
    vehicles: mockVehicles,
  };
  store.dispatch(fetchOperationData.fulfilled(data, 'test'));
  return store;
}

describe('selectFilteredShipments', () => {
  it('sin filtros devuelve todos los envíos ordenados por entrega estimada', () => {
    const store = loadedStore();
    const visible = selectFilteredShipments(store.getState());
    const dates = visible.map((shipment) => shipment.estimatedDelivery);

    expect(visible).toHaveLength(20);
    expect(dates).toEqual([...dates].sort());
  });

  it('aplica los filtros del estado de la vista', () => {
    const store = loadedStore();
    store.dispatch(setStatuses(['pending']));

    const visible = selectFilteredShipments(store.getState());

    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((shipment) => shipment.status === 'pending')).toBe(true);
    expect(selectResultCount(store.getState())).toEqual({ visible: visible.length, total: 20 });
    expect(selectHasActiveFilters(store.getState())).toBe(true);

    store.dispatch(clearFilters());
    expect(selectResultCount(store.getState())).toEqual({ visible: 20, total: 20 });
  });

  it('devuelve la misma referencia si cambia algo ajeno a los filtros', () => {
    const store = loadedStore();
    const before = selectFilteredShipments(store.getState());

    store.dispatch(toggleExpanded('123445'));

    expect(selectFilteredShipments(store.getState())).toBe(before);
  });
});

describe('estado de la vista', () => {
  it('focusShipment selecciona y expande sin duplicar', () => {
    const store = loadedStore();
    store.dispatch(focusShipment('123445'));
    store.dispatch(focusShipment('123445'));

    const { shipmentsView } = store.getState();
    expect(shipmentsView.selectedShipmentId).toBe('123445');
    expect(shipmentsView.expandedShipmentIds).toEqual(['123445']);
  });

  it('toggleExpanded alterna la expansión', () => {
    const store = loadedStore();
    store.dispatch(toggleExpanded('123445'));
    expect(selectIsExpanded(store.getState(), '123445')).toBe(true);
    store.dispatch(toggleExpanded('123445'));
    expect(selectIsExpanded(store.getState(), '123445')).toBe(false);
  });
});
