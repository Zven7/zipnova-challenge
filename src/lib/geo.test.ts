import { describe, expect, it } from 'vitest';
import { getBounds } from './geo';

describe('getBounds', () => {
  it('devuelve undefined sin puntos', () => {
    expect(getBounds([])).toBeUndefined();
  });

  it('con un punto, el rectángulo es ese punto', () => {
    expect(getBounds([{ lat: -34.6, lng: -58.4 }])).toEqual([
      [-34.6, -58.4],
      [-34.6, -58.4],
    ]);
  });

  it('abarca todos los puntos', () => {
    const points = [
      { lat: -34.6, lng: -58.4 },
      { lat: -34.49, lng: -58.5 },
      { lat: -34.76, lng: -58.36 },
    ];
    expect(getBounds(points)).toEqual([
      [-34.76, -58.5],
      [-34.49, -58.36],
    ]);
  });
});
