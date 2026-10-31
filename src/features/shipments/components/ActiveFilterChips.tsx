import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Chip } from '@/components/ui/Chip';
import { selectActiveFilterChips } from '../store/selectors';
import { clearFilters, removeFilter } from '../store/shipmentsViewSlice';

export function ActiveFilterChips() {
  const dispatch = useAppDispatch();
  const chips = useAppSelector(selectActiveFilterChips);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Filtros activos" role="group">
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          onRemove={() => {
            dispatch(removeFilter(chip.filter));
          }}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          dispatch(clearFilters());
        }}
        className="ml-1 rounded-xs text-tiny font-semibold text-primary hover:underline"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
