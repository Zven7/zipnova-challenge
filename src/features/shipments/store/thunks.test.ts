import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupStore } from '@/app/store';
import { mockDrivers } from '@/features/drivers/mock';
import { mockVehicles } from '@/features/vehicles/mock';
import { createMockShipments } from '../mock';
import {
  DISPATCH_TOO_EARLY_MESSAGE,
  DRIVER_ON_ROUTE_MESSAGE,
  VEHICLE_BUSY_MESSAGE,
} from '../rules';
import { selectShipmentById } from './selectors';
import { assignShipment, cancelShipment, changeShipmentStatus, fetchOperationData } from './thunks';

const TODAY = new Date(2026, 9, 31, 8, 0);

function loadedStore() {
  const store = setupStore();
  const data = {
    shipments: createMockShipments(TODAY),
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
  vi.setSystemTime(TODAY);
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
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-4', vehicleId: 'veh-4' })),
    );

    expect(action.meta.requestStatus).toBe('fulfilled');
    expect(selectShipmentById(store.getState(), '123445')).toMatchObject({
      status: 'assigned',
      driverId: 'drv-4',
      vehicleId: 'veh-4',
    });
  });

  it('rechaza un conductor que ese día ya usa otro vehículo', async () => {
    const store = loadedStore();
    const action = await run(
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-4', vehicleId: 'veh-5' })),
    );

    expect(action.meta.requestStatus).toBe('rejected');
    expect(action.payload).toMatch(/^Ese día el conductor ya usa /);
    expect(selectShipmentById(store.getState(), '123445')?.status).toBe('pending');
  });

  it('rechaza un vehículo en tránsito con otro envío ese día', async () => {
    const store = loadedStore();
    const action = await run(
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-4', vehicleId: 'veh-1' })),
    );

    expect(action.payload).toBe(VEHICLE_BUSY_MESSAGE);
    expect(selectShipmentById(store.getState(), '123445')?.status).toBe('pending');
  });

  it('rechaza un conductor que ese día ya salió con su vehículo', async () => {
    const store = loadedStore();
    // drv-1 tiene veh-1 en tránsito hoy (123542).
    const action = await run(
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-1', vehicleId: 'veh-4' })),
    );

    expect(action.payload).toBe(DRIVER_ON_ROUTE_MESSAGE);
  });

  it('pasada la medianoche, un envío que sigue en tránsito ocupa conductor y vehículo', async () => {
    const store = loadedStore();
    // 123542 (drv-1, veh-1) era de ayer y sigue en tránsito; 123467 ahora es de hoy.
    vi.setSystemTime(new Date(2026, 10, 1, 0, 3));
    const sameDriver = await run(
      store.dispatch(assignShipment({ id: '123467', driverId: 'drv-1', vehicleId: 'veh-1' })),
    );
    const sameVehicle = await run(
      store.dispatch(assignShipment({ id: '123467', driverId: 'drv-4', vehicleId: 'veh-1' })),
    );

    expect(sameDriver.payload).toBe(DRIVER_ON_ROUTE_MESSAGE);
    expect(sameVehicle.payload).toBe(VEHICLE_BUSY_MESSAGE);
  });

  it('un vehículo en tránsito hoy se puede asignar para otro día', async () => {
    const store = loadedStore();
    // 123467 es de mañana; veh-1 está en tránsito hoy.
    const action = await run(
      store.dispatch(assignShipment({ id: '123467', driverId: 'drv-1', vehicleId: 'veh-1' })),
    );

    expect(action.meta.requestStatus).toBe('fulfilled');
    expect(selectShipmentById(store.getState(), '123467')?.status).toBe('assigned');
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
    // 123491 y 123445 quedan hoy con veh-4.
    await run(
      store.dispatch(assignShipment({ id: '123445', driverId: 'drv-4', vehicleId: 'veh-4' })),
    );
    await run(store.dispatch(changeShipmentStatus({ id: '123491', status: 'in_transit' })));
    const action = await run(
      store.dispatch(changeShipmentStatus({ id: '123445', status: 'in_transit' })),
    );
    expect(action.meta.requestStatus).toBe('rejected');
    expect(selectShipmentById(store.getState(), '123445')?.status).toBe('assigned');
  });

  it('no despacha un envío de un día futuro', async () => {
    const store = loadedStore();
    // 123537 es de pasado mañana.
    const action = await run(
      store.dispatch(changeShipmentStatus({ id: '123537', status: 'in_transit' })),
    );
    expect(action.payload).toBe(DISPATCH_TOO_EARLY_MESSAGE);
    expect(selectShipmentById(store.getState(), '123537')?.status).toBe('assigned');
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
