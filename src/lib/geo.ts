export type LatLng = { lat: number; lng: number };
export type Bounds = [southWest: [number, number], northEast: [number, number]];

/** Rectángulo mínimo que contiene todos los puntos, o `undefined` si no hay puntos. */
export function getBounds(points: LatLng[]): Bounds | undefined {
  const [first, ...rest] = points;
  if (!first) return undefined;
  return rest.reduce<Bounds>(
    ([[south, west], [north, east]], { lat, lng }) => [
      [Math.min(south, lat), Math.min(west, lng)],
      [Math.max(north, lat), Math.max(east, lng)],
    ],
    [
      [first.lat, first.lng],
      [first.lat, first.lng],
    ],
  );
}
