import { divIcon, type DivIcon } from 'leaflet';
import { STATUS_DOT_CLASSES } from '../constants';
import type { ShipmentStatus } from '../types';

const cache = new Map<string, DivIcon>();

// Área clickeable mínima de 24 px (WCAG 2.5.8); el punto visible es más chico y va centrado.
const HIT_SIZE = 24;

/** Marcador circular con el color del estado; el seleccionado es más grande y con borde claro. */
export function getMarkerIcon(status: ShipmentStatus, selected: boolean): DivIcon {
  const key = `${status}-${String(selected)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const size = selected ? 22 : 14;
  const ring = selected ? 'border-[3px] border-fg' : 'border-2 border-bg';
  const icon = divIcon({
    className: '',
    html: `<span class="flex size-full items-center justify-center"><span class="block rounded-full shadow-elevation-1 ${ring} ${STATUS_DOT_CLASSES[status]}" style="width:${String(size)}px;height:${String(size)}px"></span></span>`,
    iconSize: [HIT_SIZE, HIT_SIZE],
    iconAnchor: [HIT_SIZE / 2, HIT_SIZE / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
  cache.set(key, icon);
  return icon;
}
