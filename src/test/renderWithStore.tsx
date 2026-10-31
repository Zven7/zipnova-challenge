import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { setupStore, type AppStore } from '@/app/store';
import { mockDrivers } from '@/features/drivers/mock';
import { createMockShipments } from '@/features/shipments/mock';
import { fetchOperationData } from '@/features/shipments/store/thunks';
import { mockVehicles } from '@/features/vehicles/mock';

/** Mismo "hoy" que el resto de los tests, para que las fechas del mock sean estables. */
export const TEST_TODAY = new Date(2026, 9, 31, 8, 0);

/** Store real con los datos del mock ya cargados. */
export function createLoadedStore(): AppStore {
  const store = setupStore();
  store.dispatch(
    fetchOperationData.fulfilled(
      {
        shipments: createMockShipments(TEST_TODAY),
        drivers: mockDrivers,
        vehicles: mockVehicles,
      },
      'test',
      undefined,
    ),
  );
  return store;
}

export function renderWithStore(ui: ReactElement, store = createLoadedStore()) {
  const user = userEvent.setup();
  return { store, user, ...render(<Provider store={store}>{ui}</Provider>) };
}
