import type { Shipment } from './types';

/** Arma un envío válido para tests, sobrescribiendo solo lo que el caso necesita. */
export function buildShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: '100001',
    trackingNumber: '0999-0000000001',
    customer: 'Cliente de prueba',
    destination: { lat: -34.6, lng: -58.4, address: 'Av. Corrientes 1234, San Nicolás, CABA' },
    status: 'pending',
    priority: 'medium',
    estimatedDelivery: new Date(2026, 9, 31, 12, 0).toISOString(),
    declaredValue: 1000,
    packages: [{ code: '10000001-1', weightKg: 1, volumeM3: 0.01 }],
    ...overrides,
  };
}
