import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Chip } from '@/components/ui/Chip';
import { selectActiveFilterChips } from '../store/selectors';
import { clearFilters, removeFilter } from '../store/shipmentsViewSlice';
import type { ActiveFilterChip } from '../types';
import { focusShipmentSearch } from './searchFocus';

export function ActiveFilterChips() {
  const dispatch = useAppDispatch();
  const chips = useAppSelector(selectActiveFilterChips);
  const groupRef = useRef<HTMLDivElement>(null);

  if (chips.length === 0) return null;

  // El botón que se quita desaparece: el foco pasa al chip vecino o, si no quedan, al buscador.
  // Las keys son estables, así que el nodo del vecino sobrevive al re-render.
  function remove(chip: ActiveFilterChip, index: number) {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[data-chip-remove]');
    const neighbor = buttons?.[index + 1] ?? buttons?.[index - 1];
    if (neighbor) neighbor.focus();
    else focusShipmentSearch();
    dispatch(removeFilter(chip.filter));
  }

  return (
    <div
      ref={groupRef}
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Filtros activos"
      role="group"
    >
      {chips.map((chip, index) => (
        <Chip
          key={chip.key}
          label={chip.label}
          onRemove={() => {
            remove(chip, index);
          }}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          focusShipmentSearch();
          dispatch(clearFilters());
        }}
        className="ml-1 rounded-xs text-tiny font-semibold text-primary hover:underline"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
