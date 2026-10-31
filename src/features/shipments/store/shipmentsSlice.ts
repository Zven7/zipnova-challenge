import { createEntityAdapter, createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { Shipment } from '../types';
import { assignShipment, cancelShipment, changeShipmentStatus, fetchOperationData } from './thunks';

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export const shipmentsAdapter = createEntityAdapter<Shipment>({
  sortComparer: (a, b) =>
    a.estimatedDelivery.localeCompare(b.estimatedDelivery) || a.id.localeCompare(b.id),
});

type ShipmentsState = ReturnType<typeof shipmentsAdapter.getInitialState> & {
  loadStatus: LoadStatus;
  loadError?: string;
};

const initialState: ShipmentsState = shipmentsAdapter.getInitialState({ loadStatus: 'idle' });

export const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperationData.pending, (state) => {
        state.loadStatus = 'loading';
        delete state.loadError;
      })
      .addCase(fetchOperationData.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        shipmentsAdapter.setAll(state, action.payload.shipments);
      })
      .addCase(fetchOperationData.rejected, (state, action) => {
        state.loadStatus = 'failed';
        state.loadError = action.payload ?? 'No pudimos cargar los envíos.';
      })
      .addMatcher(
        isAnyOf(assignShipment.fulfilled, changeShipmentStatus.fulfilled, cancelShipment.fulfilled),
        (state, action) => {
          shipmentsAdapter.updateOne(state, action.payload);
        },
      );
  },
});
