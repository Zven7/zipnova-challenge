export const SHIPMENT_SEARCH_ID = 'shipment-search';

/**
 * Lleva el foco al buscador. Se usa cuando desaparece el control que lo tenía (un chip quitado,
 * "Limpiar filtros"), para que el foco no vuelva al <body>.
 */
export function focusShipmentSearch() {
  document.getElementById(SHIPMENT_SEARCH_ID)?.focus();
}
