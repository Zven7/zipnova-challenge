import { describe, expect, it } from 'vitest';
import { setupStore } from '@/app/store';
import { mockDrivers } from '@/features/drivers/mock';
import { mockVehicles } from '@/features/vehicles/mock';
import { createMockShipments } from '../mock';
import {
  selectActiveFilterChips,
  selectAddressSuggestions,
  selectFilteredShipments,
  selectHasActiveFilters,
  selectIsExpanded,
  selectResultCount,
} from './selectors';
import {
  clearFilters,
  focusShipment,
  removeFilter,
  selectShipment,
  setAddressQuery,
  setDate,
  setDriverIds,
  setStatuses,
  toggleExpanded,
} from './shipmentsViewSlice';
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
    expect(shipmentsView.selectionSource).toBe('map');
    expect(shipmentsView.expandedShipmentIds).toEqual(['123445']);
  });

  it('selectShipment marca la lista como origen y se puede limpiar', () => {
    const store = loadedStore();
    store.dispatch(selectShipment('123445'));
    expect(store.getState().shipmentsView.selectionSource).toBe('list');
    store.dispatch(selectShipment(undefined));
    expect(store.getState().shipmentsView.selectedShipmentId).toBeUndefined();
    expect(store.getState().shipmentsView.selectionSource).toBeUndefined();
  });

  it('toggleExpanded alterna la expansión', () => {
    const store = loadedStore();
    store.dispatch(toggleExpanded('123445'));
    expect(selectIsExpanded(store.getState(), '123445')).toBe(true);
    store.dispatch(toggleExpanded('123445'));
    expect(selectIsExpanded(store.getState(), '123445')).toBe(false);
  });
});

describe('filtros activos', () => {
  it('arma chips con etiquetas legibles y removeFilter quita cada uno', () => {
    const store = loadedStore();
    store.dispatch(setStatuses(['pending', 'in_transit']));
    store.dispatch(setDriverIds(['drv-1']));
    store.dispatch(setAddressQuery('Palermo'));
    store.dispatch(setDate('2026-10-31'));

    expect(selectActiveFilterChips(store.getState()).map((chip) => chip.label)).toEqual([
      'Estado: Pendiente',
      'Estado: En tránsito',
      'Conductor: Martín Gómez',
      'Dirección: Palermo',
      'Fecha: 31/10/2026',
    ]);

    for (const chip of selectActiveFilterChips(store.getState())) {
      store.dispatch(removeFilter(chip.filter));
    }
    expect(selectActiveFilterChips(store.getState())).toEqual([]);
    expect(selectHasActiveFilters(store.getState())).toBe(false);
  });

  it('las sugerencias de dirección son únicas y ordenadas', () => {
    const suggestions = selectAddressSuggestions(loadedStore().getState());
    expect(suggestions).toHaveLength(20);
    expect(suggestions).toEqual([...suggestions].sort((a, b) => a.localeCompare(b, 'es')));
  });
});
