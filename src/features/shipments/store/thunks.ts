import { createAsyncThunk } from '@reduxjs/toolkit';
import { mockDrivers } from '@/features/drivers/mock';
import type { Driver } from '@/features/drivers/types';
import { mockVehicles } from '@/features/vehicles/mock';
import type { Vehicle } from '@/features/vehicles/types';
import { delay } from '@/lib/delay';
import { createMockShipments } from '../mock';
import type { Shipment } from '../types';

const LOAD_DELAY_MS = 600;

export type OperationData = {
  shipments: Shipment[];
  drivers: Driver[];
  vehicles: Vehicle[];
};

/** Simula la carga inicial desde un backend. */
export const fetchOperationData = createAsyncThunk<OperationData>('operation/fetch', async () => {
  await delay(LOAD_DELAY_MS);
  return { shipments: createMockShipments(), drivers: mockDrivers, vehicles: mockVehicles };
});
