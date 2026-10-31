import { useState } from 'react';

/** `simple`: base oscura con poco detalle (resaltan los marcadores). `detailed`: OpenStreetMap estándar. */
export type MapStyle = 'simple' | 'detailed';

const STORAGE_KEY = 'shipments.mapStyle';

function readStoredStyle(): MapStyle {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'detailed' ? 'detailed' : 'simple';
  } catch {
    return 'simple';
  }
}

/** Estilo del mapa (simple por defecto), recordado por navegador. */
export function useMapStyle() {
  const [style, setStyle] = useState<MapStyle>(readStoredStyle);

  function changeStyle(next: MapStyle) {
    setStyle(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sin almacenamiento disponible: la preferencia dura solo esta sesión.
    }
  }

  return [style, changeStyle] as const;
}
