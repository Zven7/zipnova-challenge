import type { Marker } from 'leaflet';
import { useEffect, type RefObject } from 'react';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/app/hooks';
import { getBounds } from '@/lib/geo';
import {
  selectSelectedShipmentId,
  selectSelectionSource,
  selectSelectionVersion,
} from '../store/selectors';

type ShipmentMapControllerProps = {
  /** Posiciones visibles serializadas ("lat,lng;lat,lng"): cambia solo si cambian los marcadores. */
  positionsKey: string;
  markerRefs: RefObject<Map<string, Marker>>;
  visible: boolean;
};

const FOCUS_ZOOM = 15;
const MAX_FIT_ZOOM = 14;

/** Sincroniza la vista del mapa con los filtros y la selección; no renderiza nada. */
export function ShipmentMapController({
  positionsKey,
  markerRefs,
  visible,
}: ShipmentMapControllerProps) {
  const map = useMap();
  const selectedId = useAppSelector(selectSelectedShipmentId);
  const selectionSource = useAppSelector(selectSelectionSource);
  const selectionVersion = useAppSelector(selectSelectionVersion);

  useEffect(() => {
    const points = positionsKey
      .split(';')
      .filter(Boolean)
      .map((pair) => {
        const [lat = 0, lng = 0] = pair.split(',').map(Number);
        return { lat, lng };
      });
    const bounds = getBounds(points);
    if (bounds) map.fitBounds(bounds, { padding: [48, 48], maxZoom: MAX_FIT_ZOOM });
  }, [map, positionsKey]);

  useEffect(() => {
    if (selectionSource !== 'list' || !selectedId) return;
    const marker = markerRefs.current.get(selectedId);
    if (!marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), FOCUS_ZOOM), { duration: 0.8 });
    map.once('moveend', () => {
      marker.openPopup();
    });
  }, [map, markerRefs, selectedId, selectionSource, selectionVersion]);

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [map, visible]);

  return null;
}
