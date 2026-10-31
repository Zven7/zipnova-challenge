import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ActiveFilter, Priority, ShipmentFilters, ShipmentStatus } from '../types';
import { emptyFilters } from './filterShipments';

export type SelectionSource = 'list' | 'map';

type ShipmentsViewState = {
  filters: ShipmentFilters;
  selectedShipmentId?: string;
  /** Desde dónde se seleccionó: la lista centra el mapa; el mapa expande la card. */
  selectionSource?: SelectionSource;
  /** Aumenta en cada selección para repetir el centrado aunque el envío ya esté seleccionado. */
  selectionVersion: number;
  expandedShipmentIds: string[];
};

const initialState: ShipmentsViewState = {
  filters: emptyFilters,
  selectionVersion: 0,
  expandedShipmentIds: [],
};

export const shipmentsViewSlice = createSlice({
  name: 'shipmentsView',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.filters.query = action.payload;
    },
    setStatuses(state, action: PayloadAction<ShipmentStatus[]>) {
      state.filters.statuses = action.payload;
    },
    setPriorities(state, action: PayloadAction<Priority[]>) {
      state.filters.priorities = action.payload;
    },
    setDriverIds(state, action: PayloadAction<string[]>) {
      state.filters.driverIds = action.payload;
    },
    setAddressQuery(state, action: PayloadAction<string>) {
      state.filters.addressQuery = action.payload;
    },
    removeFilter(state, action: PayloadAction<ActiveFilter>) {
      const filter = action.payload;
      const { filters } = state;
      switch (filter.kind) {
        case 'status':
          filters.statuses = filters.statuses.filter((status) => status !== filter.value);
          break;
        case 'priority':
          filters.priorities = filters.priorities.filter((priority) => priority !== filter.value);
          break;
        case 'driver':
          filters.driverIds = filters.driverIds.filter((driverId) => driverId !== filter.value);
          break;
        case 'address':
          filters.addressQuery = '';
          break;
        case 'date':
          delete filters.date;
          break;
      }
    },
    setDate(state, action: PayloadAction<string | undefined>) {
      if (action.payload === undefined) delete state.filters.date;
      else state.filters.date = action.payload;
    },
    clearFilters(state) {
      state.filters = emptyFilters;
    },
    /** Selección desde la lista ("ubicar en el mapa"). */
    selectShipment(state, action: PayloadAction<string | undefined>) {
      if (action.payload === undefined) {
        delete state.selectedShipmentId;
        delete state.selectionSource;
      } else {
        state.selectedShipmentId = action.payload;
        state.selectionSource = 'list';
        state.selectionVersion += 1;
      }
    },
    /** Selección desde el mapa: además expande la card. */
    focusShipment(state, action: PayloadAction<string>) {
      state.selectedShipmentId = action.payload;
      state.selectionSource = 'map';
      state.selectionVersion += 1;
      if (!state.expandedShipmentIds.includes(action.payload)) {
        state.expandedShipmentIds.push(action.payload);
      }
    },
    expandShipment(state, action: PayloadAction<string>) {
      if (!state.expandedShipmentIds.includes(action.payload)) {
        state.expandedShipmentIds.push(action.payload);
      }
    },
    toggleExpanded(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.expandedShipmentIds = state.expandedShipmentIds.includes(id)
        ? state.expandedShipmentIds.filter((expandedId) => expandedId !== id)
        : [...state.expandedShipmentIds, id];
    },
  },
});

export const {
  setQuery,
  setStatuses,
  setPriorities,
  setDriverIds,
  setAddressQuery,
  setDate,
  removeFilter,
  clearFilters,
  selectShipment,
  focusShipment,
  expandShipment,
  toggleExpanded,
} = shipmentsViewSlice.actions;
