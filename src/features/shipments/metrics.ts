import type { Shipment, ShipmentMetrics } from './types';

/** Las métricas de la card se derivan de los paquetes para que no puedan quedar inconsistentes. */
export function getShipmentMetrics(shipment: Shipment): ShipmentMetrics {
  return shipment.packages.reduce<ShipmentMetrics>(
    (totals, item) => ({
      ...totals,
      weightKg: totals.weightKg + item.weightKg,
      volumeM3: totals.volumeM3 + item.volumeM3,
    }),
    {
      weightKg: 0,
      volumeM3: 0,
      packageCount: shipment.packages.length,
      value: shipment.declaredValue,
    },
  );
}
