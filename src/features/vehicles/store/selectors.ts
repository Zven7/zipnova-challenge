import type { RootState } from '@/app/store';
import { vehiclesAdapter } from './vehiclesSlice';

export const {
  selectAll: selectAllVehicles,
  selectById: selectVehicleById,
  selectEntities: selectVehicleEntities,
} = vehiclesAdapter.getSelectors((state: RootState) => state.vehicles);
