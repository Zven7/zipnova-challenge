import { describe, expect, it } from 'vitest';
import {
  canAssign,
  canCancel,
  canDispatch,
  canTransition,
  describePairingConflict,
  getBusyVehicleIds,
  getDayVehicleId,
  getNextStatus,
  getPairingConflict,
  getSameDayAssignments,
  isDriverOnRoute,
} from './rules';
import { buildShipment } from './testing';
import { SHIPMENT_STATUSES } from './types';

describe('getNextStatus', () => {
  it('sigue el flujo pending → assigned → in_transit → delivered', () => {
    expect(getNextStatus('pending')).toBe('assigned');
    expect(getNextStatus('assigned')).toBe('in_transit');
    expect(getNextStatus('in_transit')).toBe('delivered');
    expect(getNextStatus('delivered')).toBeUndefined();
    expect(getNextStatus('cancelled')).toBeUndefined();
  });
});

describe('canTransition', () => {
  it('no permite saltear pasos ni volver atrás', () => {
    expect(canTransition('pending', 'in_transit')).toBe(false);
    expect(canTransition('in_transit', 'assigned')).toBe(false);
    expect(canTransition('assigned', 'in_transit')).toBe(true);
  });

  it('permite cancelar desde cualquier estado excepto entregado', () => {
    const allowed = SHIPMENT_STATUSES.filter((status) => canTransition(status, 'cancelled'));
    expect(allowed).toEqual(['pending', 'assigned', 'in_transit']);
  });
});

describe('canCancel y canAssign', () => {
  it('no cancela entregados ni cancelados', () => {
    expect(canCancel('delivered')).toBe(false);
    expect(canCancel('cancelled')).toBe(false);
    expect(canCancel('in_transit')).toBe(true);
  });

  it('solo asigna o reasigna antes de salir', () => {
    expect(SHIPMENT_STATUSES.filter(canAssign)).toEqual(['pending', 'assigned']);
  });
});

describe('canDispatch', () => {
  const today = new Date(2026, 9, 31, 8, 0);
  const deliveringOn = (date: number) =>
    buildShipment({ estimatedDelivery: new Date(2026, 9, date, 18).toISOString() });

  it('despacha el día de la entrega o si está atrasado', () => {
    expect(canDispatch(deliveringOn(31), today)).toBe(true);
    expect(canDispatch(deliveringOn(30), today)).toBe(true);
  });

  it('no despacha envíos de días futuros', () => {
    expect(canDispatch(deliveringOn(32), today)).toBe(false);
  });
});

describe('getBusyVehicleIds', () => {
  const on = (date: number) => new Date(2026, 9, date, 12).toISOString();
  const target = buildShipment({ id: 'target', estimatedDelivery: on(31) });
  const inTransit = buildShipment({
    id: '1',
    status: 'in_transit',
    vehicleId: 'veh-1',
    estimatedDelivery: on(31),
  });
  const shipments = [
    target,
    inTransit,
    buildShipment({ id: '2', status: 'assigned', vehicleId: 'veh-2', estimatedDelivery: on(31) }),
    buildShipment({ id: '3', status: 'in_transit', vehicleId: 'veh-3', estimatedDelivery: on(31) }),
    buildShipment({ id: '4', status: 'delivered', vehicleId: 'veh-4', estimatedDelivery: on(31) }),
    buildShipment({ id: '5', status: 'in_transit', vehicleId: 'veh-5', estimatedDelivery: on(30) }),
  ];

  it('devuelve solo vehículos en tránsito el mismo día', () => {
    expect(getBusyVehicleIds(shipments, target)).toEqual(['veh-1', 'veh-3']);
  });

  it('no cuenta el propio envío', () => {
    expect(getBusyVehicleIds(shipments, inTransit)).toEqual(['veh-3']);
  });
});

describe('isDriverOnRoute', () => {
  const sameDay = [{ driverId: 'drv-1', vehicleId: 'veh-1' }];

  it('el conductor cuyo vehículo del día está en tránsito no puede sumar envíos', () => {
    expect(isDriverOnRoute('drv-1', sameDay, ['veh-1'])).toBe(true);
  });

  it('si el vehículo del día está libre, o no tiene envíos ese día, puede sumar', () => {
    expect(isDriverOnRoute('drv-1', sameDay, [])).toBe(false);
    expect(isDriverOnRoute('drv-2', sameDay, ['veh-1'])).toBe(false);
  });
});

describe('emparejamiento conductor–vehículo por día', () => {
  const day = (date: number, hour = 12) => new Date(2026, 9, date, hour).toISOString();
  const target = buildShipment({ id: 'target', estimatedDelivery: day(31, 18) });
  const shipments = [
    target,
    buildShipment({
      id: '1',
      status: 'assigned',
      driverId: 'drv-1',
      vehicleId: 'veh-1',
      estimatedDelivery: day(31, 9),
    }),
    buildShipment({
      id: '2',
      status: 'delivered',
      driverId: 'drv-2',
      vehicleId: 'veh-2',
      estimatedDelivery: day(31),
    }),
    buildShipment({
      id: '3',
      status: 'cancelled',
      driverId: 'drv-3',
      vehicleId: 'veh-3',
      estimatedDelivery: day(31),
    }),
    buildShipment({
      id: '4',
      status: 'assigned',
      driverId: 'drv-4',
      vehicleId: 'veh-4',
      estimatedDelivery: day(30),
    }),
  ];
  const sameDay = getSameDayAssignments(shipments, target);

  it('toma los otros envíos del mismo día que comprometen conductor y vehículo', () => {
    expect(sameDay).toEqual([
      { driverId: 'drv-1', vehicleId: 'veh-1' },
      { driverId: 'drv-2', vehicleId: 'veh-2' },
    ]);
  });

  it('rechaza un conductor con otro vehículo ese día', () => {
    expect(getPairingConflict({ driverId: 'drv-1', vehicleId: 'veh-5' }, sameDay)).toEqual({
      kind: 'driver',
      vehicleId: 'veh-1',
    });
  });

  it('rechaza un vehículo que ese día maneja otro conductor', () => {
    expect(getPairingConflict({ driverId: 'drv-5', vehicleId: 'veh-2' }, sameDay)).toEqual({
      kind: 'vehicle',
      driverId: 'drv-2',
    });
  });

  it('acepta el mismo par o uno libre ese día', () => {
    expect(getPairingConflict({ driverId: 'drv-1', vehicleId: 'veh-1' }, sameDay)).toBeUndefined();
    expect(getPairingConflict({ driverId: 'drv-4', vehicleId: 'veh-3' }, sameDay)).toBeUndefined();
  });

  it('sugiere el vehículo que el conductor ya usa ese día', () => {
    expect(getDayVehicleId('drv-2', sameDay)).toBe('veh-2');
    expect(getDayVehicleId('drv-5', sameDay)).toBeUndefined();
  });

  it('describe el conflicto con nombres', () => {
    const drivers = [{ id: 'drv-2', name: 'Diego Romero', phone: '' }];
    const vehicles = [{ id: 'veh-1', plate: 'AB123CD', model: 'Peugeot Partner', capacityKg: 650 }];
    expect(describePairingConflict({ kind: 'driver', vehicleId: 'veh-1' }, drivers, vehicles)).toBe(
      'Ese día el conductor ya usa Peugeot Partner (AB123CD).',
    );
    expect(describePairingConflict({ kind: 'vehicle', driverId: 'drv-2' }, drivers, vehicles)).toBe(
      'Ese día el vehículo ya lo maneja Diego Romero.',
    );
  });
});
