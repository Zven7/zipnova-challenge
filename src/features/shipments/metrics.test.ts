import { describe, expect, it } from 'vitest';
import { getShipmentMetrics } from './metrics';
import { buildShipment } from './testing';

describe('getShipmentMetrics', () => {
  it('suma peso y volumen de los paquetes y toma el valor declarado', () => {
    const shipment = buildShipment({
      declaredValue: 230000,
      packages: [
        { code: '11259495-1', weightKg: 30, volumeM3: 0.1 },
        { code: '11259496-1', weightKg: 30, volumeM3: 0.1 },
      ],
    });

    const metrics = getShipmentMetrics(shipment);

    expect(metrics.weightKg).toBe(60);
    expect(metrics.volumeM3).toBeCloseTo(0.2);
    expect(metrics.packageCount).toBe(2);
    expect(metrics.value).toBe(230000);
  });

  it('devuelve ceros si no hay paquetes', () => {
    const metrics = getShipmentMetrics(buildShipment({ packages: [] }));
    expect(metrics).toMatchObject({ weightKg: 0, volumeM3: 0, packageCount: 0 });
  });
});
