import type { Marker } from 'leaflet';
import { useEffect, useRef, type RefObject } from 'react';
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
  /** Con el mapa oculto (pestaña en mobile) su tamaño es 0 y Leaflet no puede calcular la vista. */
  visible: boolean;
};

const FOCUS_ZOOM = 15;
const MAX_FIT_ZOOM = 14;

function parsePositions(key: string) {
  return key
    .split(';')
    .filter(Boolean)
    .map((pair) => {
      const [lat = 0, lng = 0] = pair.split(',').map(Number);
      return { lat, lng };
    });
}

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
  // Lo último que ya se aplicó, para no repetirlo al volver a mostrar el mapa.
  const fittedKey = useRef<string | null>(null);
  const focusedVersion = useRef(0);

  useEffect(() => {
    if (!visible) return;
    map.invalidateSize();
    if (fittedKey.current === positionsKey) return;
    fittedKey.current = positionsKey;
    const bounds = getBounds(parsePositions(positionsKey));
    if (bounds) map.fitBounds(bounds, { padding: [48, 48], maxZoom: MAX_FIT_ZOOM });
  }, [map, positionsKey, visible]);

  useEffect(() => {
    if (!visible || selectionSource !== 'list' || !selectedId) return;
    if (focusedVersion.current === selectionVersion) return;
    const marker = markerRefs.current.get(selectedId);
    if (!marker) return;
    focusedVersion.current = selectionVersion;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), FOCUS_ZOOM), { duration: 0.8 });
    map.once('moveend', () => {
      marker.openPopup();
    });
  }, [map, markerRefs, selectedId, selectionSource, selectionVersion, visible]);

  return null;
}
