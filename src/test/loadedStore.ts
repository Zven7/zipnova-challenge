import { setupStore, type AppStore } from '@/app/store';
import { mockDrivers } from '@/features/drivers/mock';
import { createMockShipments } from '@/features/shipments/mock';
import { fetchOperationData } from '@/features/shipments/store/thunks';
import { mockVehicles } from '@/features/vehicles/mock';

/** Mismo "hoy" que el resto de los tests, para que las fechas del mock sean estables. */
export const TEST_TODAY = new Date(2026, 9, 31, 8, 0);

/** Store real con los datos del mock ya cargados. Lo usan los tests y las stories. */
export function createLoadedStore(today: Date = TEST_TODAY): AppStore {
  const store = setupStore();
  store.dispatch(
    fetchOperationData.fulfilled(
      {
        shipments: createMockShipments(today),
        drivers: mockDrivers,
        vehicles: mockVehicles,
      },
      'test',
      undefined,
    ),
  );
  return store;
}
