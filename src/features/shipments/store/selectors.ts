import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
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
