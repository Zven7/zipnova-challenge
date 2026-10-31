import { describe, expect, it } from 'vitest';
import { mockDrivers } from '@/features/drivers/mock';
import { mockVehicles } from '@/features/vehicles/mock';
import { isoToDateKey, toDateKey } from '@/lib/date';
import { createMockShipments } from './mock';
import { getPairingConflict, getSameDayAssignments } from './rules';

const today = new Date(2026, 9, 31, 8, 0);
const shipments = createMockShipments(today);
const byStatus = (status: string) => shipments.filter((shipment) => shipment.status === status);

describe('mock de la operación', () => {
  it('tiene 20 envíos, 5 conductores y 5 vehículos', () => {
    expect(shipments).toHaveLength(20);
    expect(mockDrivers).toHaveLength(5);
    expect(mockVehicles).toHaveLength(5);
  });

  it('usa ids únicos', () => {
    expect(new Set(shipments.map((shipment) => shipment.id)).size).toBe(20);
  });

  it('tiene al menos 3 pendientes, 1 entregado y 1 cancelado', () => {
    expect(byStatus('pending').length).toBeGreaterThanOrEqual(3);
    expect(byStatus('delivered').length).toBeGreaterThanOrEqual(1);
    expect(byStatus('cancelled').length).toBeGreaterThanOrEqual(1);
  });

  it('los pendientes no tienen conductor ni vehículo', () => {
    for (const shipment of byStatus('pending')) {
      expect(shipment.driverId).toBeUndefined();
      expect(shipment.vehicleId).toBeUndefined();
    }
  });

  it('los asignados y en tránsito tienen conductor y vehículo existentes', () => {
    const driverIds = mockDrivers.map((driver) => driver.id);
    const vehicleIds = mockVehicles.map((vehicle) => vehicle.id);
    for (const shipment of [...byStatus('assigned'), ...byStatus('in_transit')]) {
      expect(driverIds).toContain(shipment.driverId);
      expect(vehicleIds).toContain(shipment.vehicleId);
    }
  });

  it('no usa el mismo vehículo en dos envíos en tránsito', () => {
    const vehicles = byStatus('in_transit').map((shipment) => shipment.vehicleId);
    expect(new Set(vehicles).size).toBe(vehicles.length);
  });

  it('ubica todos los destinos en Buenos Aires y alrededores', () => {
    for (const { destination } of shipments) {
      expect(destination.lat).toBeGreaterThan(-34.85);
      expect(destination.lat).toBeLessThan(-34.4);
      expect(destination.lng).toBeGreaterThan(-58.7);
      expect(destination.lng).toBeLessThan(-58.3);
    }
  });

  it('genera fechas relativas al día actual', () => {
    const todayKey = toDateKey(today);
    expect(
      shipments.some((shipment) => isoToDateKey(shipment.estimatedDelivery) === todayKey),
    ).toBe(true);
  });

  it('cada envío tiene al menos un paquete', () => {
    for (const shipment of shipments) expect(shipment.packages.length).toBeGreaterThan(0);
  });

  it('respeta un vehículo por conductor y un conductor por vehículo en cada día', () => {
    for (const shipment of shipments) {
      const { driverId, vehicleId } = shipment;
      if (!driverId || !vehicleId) continue;
      const sameDay = getSameDayAssignments(shipments, shipment);
      expect(getPairingConflict({ driverId, vehicleId }, sameDay)).toBeUndefined();
    }
  });
});
