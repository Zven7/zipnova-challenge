import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { driversSlice } from '@/features/drivers/store/driversSlice';
import { shipmentsSlice } from '@/features/shipments/store/shipmentsSlice';
import { shipmentsViewSlice } from '@/features/shipments/store/shipmentsViewSlice';
import { vehiclesSlice } from '@/features/vehicles/store/vehiclesSlice';

const rootReducer = combineReducers({
  shipments: shipmentsSlice.reducer,
  shipmentsView: shipmentsViewSlice.reducer,
  drivers: driversSlice.reducer,
  vehicles: vehiclesSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
