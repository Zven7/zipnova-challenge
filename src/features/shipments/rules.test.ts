import { describe, expect, it } from 'vitest';
import { canAssign, canCancel, canTransition, getBusyVehicleIds, getNextStatus } from './rules';
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

describe('getBusyVehicleIds', () => {
  const shipments = [
    buildShipment({ id: '1', status: 'in_transit', vehicleId: 'veh-1' }),
    buildShipment({ id: '2', status: 'assigned', vehicleId: 'veh-2' }),
    buildShipment({ id: '3', status: 'in_transit', vehicleId: 'veh-3' }),
    buildShipment({ id: '4', status: 'delivered', vehicleId: 'veh-4' }),
  ];

  it('devuelve solo vehículos de envíos en tránsito', () => {
    expect(getBusyVehicleIds(shipments)).toEqual(['veh-1', 'veh-3']);
  });

  it('excluye el envío que se está editando', () => {
    expect(getBusyVehicleIds(shipments, '1')).toEqual(['veh-3']);
  });
});
