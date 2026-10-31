import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupStore } from '@/app/store';
import { mockDrivers } from '@/features/drivers/mock';
import { mockVehicles } from '@/features/vehicles/mock';
import { createMockShipments } from '../mock';
import { VEHICLE_BUSY_MESSAGE } from '../rules';
import { selectShipmentById } from './selectors';
import { assignShipment, cancelShipment, changeShipmentStatus, fetchOperationData } from './thunks';

function loadedStore() {
  const store = setupStore();
  const data = {
    shipments: createMockShipments(new Date(2026, 9, 31, 8, 0)),
    drivers: mockDrivers,
    vehicles: mockVehicles,
  };
  store.dispatch(fetchOperationData.fulfilled(data, 'test', undefined));
  return store;
}

/** Ejecuta un thunk avanzando el delay simulado. */
async function run<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('window', { location: { search: '' } });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('assignShipment', () => {
  it('asigna conductor y vehículo y pasa el envío a asignado', async () => {
    const store = loadedStore();
    const action = await run(
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-2', vehicleId: 'veh-4' })),
    );

    expect(action.meta.requestStatus).toBe('fulfilled');
    expect(selectShipmentById(store.getState(), '123445')).toMatchObject({
      status: 'assigned',
      driverId: 'drv-2',
      vehicleId: 'veh-4',
    });
  });

  it('rechaza un vehículo en tránsito con otro envío', async () => {
    const store = loadedStore();
    const action = await run(
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-2', vehicleId: 'veh-1' })),
    );

    expect(action.payload).toBe(VEHICLE_BUSY_MESSAGE);
    expect(selectShipmentById(store.getState(), '123445')?.status).toBe('pending');
  });

  it('simula un error de red con ?simular-error=acciones', async () => {
    vi.stubGlobal('window', { location: { search: '?simular-error=acciones' } });
    const store = loadedStore();
    const action = await run(
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-2', vehicleId: 'veh-4' })),
    );
    expect(action.meta.requestStatus).toBe('rejected');
  });
});

describe('changeShipmentStatus', () => {
  it('avanza al siguiente estado del flujo', async () => {
    const store = loadedStore();
    await run(store.dispatch(changeShipmentStatus({ id: '123542', status: 'delivered' })));
    expect(selectShipmentById(store.getState(), '123542')?.status).toBe('delivered');
  });

  it('no permite saltear pasos', async () => {
    const store = loadedStore();
    const action = await run(
      store.dispatch(changeShipmentStatus({ id: '123445', status: 'delivered' })),
    );
    expect(action.meta.requestStatus).toBe('rejected');
  });

  it('no despacha si el vehículo ya está en tránsito con otro envío', async () => {
    const store = loadedStore();
    // 123491 y 123516 comparten veh-4.
    await run(store.dispatch(changeShipmentStatus({ id: '123491', status: 'in_transit' })));
    const action = await run(
      store.dispatch(changeShipmentStatus({ id: '123516', status: 'in_transit' })),
    );
    expect(action.meta.requestStatus).toBe('rejected');
    expect(selectShipmentById(store.getState(), '123516')?.status).toBe('assigned');
  });
});

describe('cancelShipment', () => {
  it('cancela con motivo opcional', async () => {
    const store = loadedStore();
    await run(store.dispatch(cancelShipment({ id: '123445', reason: '  Sin stock  ' })));
    expect(selectShipmentById(store.getState(), '123445')).toMatchObject({
      status: 'cancelled',
      cancellationReason: 'Sin stock',
    });
  });

  it('no cancela un envío entregado', async () => {
    const store = loadedStore();
    const action = await run(store.dispatch(cancelShipment({ id: '123570', reason: '' })));
    expect(action.meta.requestStatus).toBe('rejected');
  });
});
