import { divIcon, type DivIcon } from 'leaflet';
import { STATUS_DOT_CLASSES } from '../constants';
import type { ShipmentStatus } from '../types';

const cache = new Map<string, DivIcon>();

/** Marcador circular con el color del estado; el seleccionado es más grande y con borde claro. */
export function getMarkerIcon(status: ShipmentStatus, selected: boolean): DivIcon {
  const key = `${status}-${String(selected)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const size = selected ? 22 : 14;
  const ring = selected ? 'border-[3px] border-fg' : 'border-2 border-bg';
  const icon = divIcon({
    className: '',
    html: `<span class="block size-full rounded-full shadow-elevation-1 ${ring} ${STATUS_DOT_CLASSES[status]}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
  cache.set(key, icon);
  return icon;
}
