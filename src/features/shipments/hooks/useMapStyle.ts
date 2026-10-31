import { useState } from 'react';

export type MapStyle = 'dark' | 'light';

const STORAGE_KEY = 'shipments.mapStyle';

function readStoredStyle(): MapStyle {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Estilo del mapa (oscuro por defecto), recordado por navegador. */
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
