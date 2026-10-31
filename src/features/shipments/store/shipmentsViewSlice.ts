import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Priority, ShipmentFilters, ShipmentStatus } from '../types';
import { emptyFilters } from './filterShipments';

type ShipmentsViewState = {
  filters: ShipmentFilters;
  selectedShipmentId?: string;
  expandedShipmentIds: string[];
};

const initialState: ShipmentsViewState = {
  filters: emptyFilters,
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
    setDate(state, action: PayloadAction<string | undefined>) {
      if (action.payload === undefined) delete state.filters.date;
      else state.filters.date = action.payload;
    },
    clearFilters(state) {
      state.filters = emptyFilters;
    },
    /** Selección desde la lista ("ubicar en el mapa"). */
    selectShipment(state, action: PayloadAction<string | undefined>) {
      if (action.payload === undefined) delete state.selectedShipmentId;
      else state.selectedShipmentId = action.payload;
    },
    /** Selección desde el mapa: además expande la card. */
    focusShipment(state, action: PayloadAction<string>) {
      state.selectedShipmentId = action.payload;
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
  clearFilters,
  selectShipment,
  focusShipment,
  toggleExpanded,
} = shipmentsViewSlice.actions;
