import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  selectFilteredShipmentIds,
  selectHasActiveFilters,
  selectLoadError,
  selectLoadStatus,
} from '../store/selectors';
import { clearFilters } from '../store/shipmentsViewSlice';
import { fetchOperationData } from '../store/thunks';
import { ShipmentCard } from './ShipmentCard';

type ShipmentListProps = {
  onLocate: () => void;
  onOpenActions: (id: string) => void;
  registerCard: (id: string, element: HTMLElement | null) => void;
};

const SKELETON_COUNT = 6;

export function ShipmentList({ onLocate, onOpenActions, registerCard }: ShipmentListProps) {
  const dispatch = useAppDispatch();
  const loadStatus = useAppSelector(selectLoadStatus);
  const loadError = useAppSelector(selectLoadError);
  const ids = useAppSelector(selectFilteredShipmentIds);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);

  if (loadStatus === 'idle' || loadStatus === 'loading') {
    return (
      <ul aria-busy="true" aria-label="Cargando envíos" className="flex flex-col gap-2">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="h-[58px] animate-pulse rounded-md bg-surface-raised" />
        ))}
      </ul>
    );
  }

  if (loadStatus === 'failed') {
    return (
      <EmptyState
        title={loadError ?? 'Algo salió mal.'}
        description="Revisa tu conexión e intenta de nuevo."
        action={
          <Button
            onClick={() => {
              void dispatch(fetchOperationData());
            }}
          >
            Reintentar
          </Button>
        }
      />
    );
  }

  if (ids.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="Ningún envío coincide con los filtros"
        description="Prueba con otra búsqueda o quita algunos filtros."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              dispatch(clearFilters());
            }}
          >
            Limpiar filtros
          </Button>
        }
      />
    ) : (
      <EmptyState title="No hay envíos en operación" />
    );
  }

  return (
    <ul aria-label="Envíos" className="flex flex-col gap-2">
      {ids.map((id) => (
        <li key={id}>
          <ShipmentCard
            id={id}
            onLocate={onLocate}
            onOpenActions={onOpenActions}
            ref={(element) => {
              registerCard(id, element);
            }}
          />
        </li>
      ))}
    </ul>
  );
}
