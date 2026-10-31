import type { RootState } from '@/app/store';
import { driversAdapter } from './driversSlice';

export const {
  selectAll: selectAllDrivers,
  selectById: selectDriverById,
  selectEntities: selectDriverEntities,
} = driversAdapter.getSelectors((state: RootState) => state.drivers);
