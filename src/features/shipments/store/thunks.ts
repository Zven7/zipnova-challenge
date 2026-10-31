import { createAsyncThunk, type Update } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { mockDrivers } from '@/features/drivers/mock';
import type { Driver } from '@/features/drivers/types';
import { mockVehicles } from '@/features/vehicles/mock';
import type { Vehicle } from '@/features/vehicles/types';
import { delay } from '@/lib/delay';
import { shouldSimulateFailure } from '@/lib/simulation';
import { createMockShipments } from '../mock';
import {
  canAssign,
  canCancel,
  canTransition,
  describePairingConflict,
  getBusyVehicleIds,
  getPairingConflict,
  getSameDayAssignments,
  VEHICLE_BUSY_MESSAGE,
} from '../rules';
import type { Shipment, ShipmentStatus } from '../types';

const LOAD_DELAY_MS = 600;
const ACTION_DELAY_MS = 700;
const NETWORK_ERROR = 'No pudimos guardar el cambio. Intenta de nuevo.';

export type OperationData = {
  shipments: Shipment[];
  drivers: Driver[];
  vehicles: Vehicle[];
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  rejectValue: string;
}>();

/** Simula la carga inicial desde un backend. */
export const fetchOperationData = createAppAsyncThunk(
  'operation/fetch',
  async (_: undefined, { rejectWithValue }) => {
    await delay(LOAD_DELAY_MS);
    if (shouldSimulateFailure('carga')) return rejectWithValue('No pudimos cargar los envíos.');
    return { shipments: createMockShipments(), drivers: mockDrivers, vehicles: mockVehicles };
  },
);

// Las acciones vuelven a validar contra el estado actual, como lo haría un backend.

function update(id: string, changes: Partial<Shipment>): Update<Shipment, string> {
  return { id, changes };
}

function getShipments(state: RootState): Shipment[] {
  return Object.values(state.shipments.entities);
}

export const assignShipment = createAppAsyncThunk(
  'shipments/assign',
  async (
    { id, driverId, vehicleId }: { id: string; driverId: string; vehicleId: string },
    { getState, rejectWithValue },
  ) => {
    await delay(ACTION_DELAY_MS);
    if (shouldSimulateFailure('acciones')) return rejectWithValue(NETWORK_ERROR);

    const state = getState();
    const shipment = state.shipments.entities[id];
    if (!shipment || !canAssign(shipment.status)) {
      return rejectWithValue('Este envío ya no se puede asignar.');
    }
    const shipments = getShipments(state);
    if (getBusyVehicleIds(shipments, id).includes(vehicleId)) {
      return rejectWithValue(VEHICLE_BUSY_MESSAGE);
    }
    const conflict = getPairingConflict(
      { driverId, vehicleId },
      getSameDayAssignments(shipments, shipment),
    );
    if (conflict) {
      return rejectWithValue(
        describePairingConflict(
          conflict,
          Object.values(state.drivers.entities),
          Object.values(state.vehicles.entities),
        ),
      );
    }
    return update(id, { driverId, vehicleId, status: 'assigned' });
  },
);

export const changeShipmentStatus = createAppAsyncThunk(
  'shipments/changeStatus',
  async ({ id, status }: { id: string; status: ShipmentStatus }, { getState, rejectWithValue }) => {
    await delay(ACTION_DELAY_MS);
    if (shouldSimulateFailure('acciones')) return rejectWithValue(NETWORK_ERROR);

    const state = getState();
    const shipment = state.shipments.entities[id];
    if (!shipment || status === 'cancelled' || !canTransition(shipment.status, status)) {
      return rejectWithValue('Ese cambio de estado no está permitido.');
    }
    if (
      status === 'in_transit' &&
      shipment.vehicleId !== undefined &&
      getBusyVehicleIds(getShipments(state), id).includes(shipment.vehicleId)
    ) {
      return rejectWithValue(`${VEHICLE_BUSY_MESSAGE} Reasigna otro vehículo antes de despachar.`);
    }
    return update(id, { status });
  },
);

export const cancelShipment = createAppAsyncThunk(
  'shipments/cancel',
  async ({ id, reason }: { id: string; reason: string }, { getState, rejectWithValue }) => {
    await delay(ACTION_DELAY_MS);
    if (shouldSimulateFailure('acciones')) return rejectWithValue(NETWORK_ERROR);

    const shipment = getState().shipments.entities[id];
    if (!shipment || !canCancel(shipment.status)) {
      return rejectWithValue('Este envío ya no se puede cancelar.');
    }
    const trimmed = reason.trim();
    return update(id, {
      status: 'cancelled',
      cancellationReason: trimmed === '' ? undefined : trimmed,
    });
  },
);
