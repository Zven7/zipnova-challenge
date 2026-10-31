import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { fetchOperationData } from '@/features/shipments/store/thunks';
import type { Driver } from '../types';

export const driversAdapter = createEntityAdapter<Driver>({
  sortComparer: (a, b) => a.name.localeCompare(b.name, 'es'),
});

export const driversSlice = createSlice({
  name: 'drivers',
  initialState: driversAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOperationData.fulfilled, (state, action) => {
      driversAdapter.setAll(state, action.payload.drivers);
    });
  },
});
