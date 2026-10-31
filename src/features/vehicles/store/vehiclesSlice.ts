import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { fetchOperationData } from '@/features/shipments/store/thunks';
import type { Vehicle } from '../types';

export const vehiclesAdapter = createEntityAdapter<Vehicle>({
  sortComparer: (a, b) => a.model.localeCompare(b.model, 'es'),
});

export const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState: vehiclesAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOperationData.fulfilled, (state, action) => {
      vehiclesAdapter.setAll(state, action.payload.vehicles);
    });
  },
});
