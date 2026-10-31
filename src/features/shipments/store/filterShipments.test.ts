import { describe, expect, it } from 'vitest';
import { buildShipment } from '../testing';
import type { ShipmentFilters } from '../types';
import { emptyFilters, filterShipments, hasActiveFilters, matchesFilters } from './filterShipments';

const withFilters = (overrides: Partial<ShipmentFilters>): ShipmentFilters => ({
  ...emptyFilters,
  ...overrides,
});

describe('matchesFilters', () => {
  const shipment = buildShipment({
    id: '123445',
    trackingNumber: '0999-2234908283',
    customer: 'Óptica Visión Clara',
    destination: { lat: -34.58, lng: -58.39, address: 'Av. Pueyrredón 1700, Recoleta, CABA' },
    status: 'assigned',
    priority: 'high',
    driverId: 'drv-1',
    estimatedDelivery: new Date(2026, 9, 31, 18, 0).toISOString(),
  });

  it('sin filtros coincide con todo', () => {
    expect(matchesFilters(shipment, emptyFilters)).toBe(true);
  });

  it.each(['123445', '2234908', 'optica vision', 'pueyrredon'])(
    'la búsqueda libre encuentra "%s"',
    (query) => {
      expect(matchesFilters(shipment, withFilters({ query }))).toBe(true);
    },
  );

  it('la búsqueda libre descarta lo que no coincide', () => {
    expect(matchesFilters(shipment, withFilters({ query: 'palermo' }))).toBe(false);
  });

  it('combina con "o" los valores de un mismo filtro', () => {
    expect(matchesFilters(shipment, withFilters({ statuses: ['pending', 'assigned'] }))).toBe(true);
    expect(matchesFilters(shipment, withFilters({ statuses: ['pending'] }))).toBe(false);
  });

  it('combina con "y" filtros distintos', () => {
    expect(
      matchesFilters(shipment, withFilters({ statuses: ['assigned'], priorities: ['low'] })),
    ).toBe(false);
  });

  it('filtra por conductor y excluye envíos sin conductor', () => {
    expect(matchesFilters(shipment, withFilters({ driverIds: ['drv-1'] }))).toBe(true);
    const unassigned = buildShipment({ driverId: undefined });
    expect(matchesFilters(unassigned, withFilters({ driverIds: ['drv-1'] }))).toBe(false);
  });

  it('filtra por dirección', () => {
    expect(matchesFilters(shipment, withFilters({ addressQuery: 'recoleta' }))).toBe(true);
    expect(matchesFilters(shipment, withFilters({ addressQuery: 'belgrano' }))).toBe(false);
  });

  it('filtra por día de entrega estimada', () => {
    expect(matchesFilters(shipment, withFilters({ date: '2026-10-31' }))).toBe(true);
    expect(matchesFilters(shipment, withFilters({ date: '2026-11-01' }))).toBe(false);
  });
});

describe('filterShipments', () => {
  it('conserva el orden original', () => {
    const shipments = [
      buildShipment({ id: '3', priority: 'high' }),
      buildShipment({ id: '1', priority: 'low' }),
      buildShipment({ id: '2', priority: 'high' }),
    ];
    const result = filterShipments(shipments, withFilters({ priorities: ['high'] }));
    expect(result.map((shipment) => shipment.id)).toEqual(['3', '2']);
  });
});

describe('hasActiveFilters', () => {
  it('es false con los filtros vacíos o solo con espacios', () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false);
    expect(hasActiveFilters(withFilters({ query: '  ' }))).toBe(false);
  });

  it('es true con cualquier filtro aplicado', () => {
    expect(hasActiveFilters(withFilters({ date: '2026-10-31' }))).toBe(true);
    expect(hasActiveFilters(withFilters({ driverIds: ['drv-1'] }))).toBe(true);
  });
});
