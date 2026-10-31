import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import {
  selectLoadStatus,
  selectResultCount,
  selectSelectedShipmentId,
  selectSelectionSource,
  selectSelectionVersion,
} from '../store/selectors';
import { ActiveFilterChips } from './ActiveFilterChips';
import { ShipmentFilters } from './ShipmentFilters';
import { ShipmentList } from './ShipmentList';

type ShipmentsPanelProps = {
  onLocate: () => void;
  onOpenActions: (id: string) => void;
};

export function ShipmentsPanel({ onLocate, onOpenActions }: ShipmentsPanelProps) {
  const loadStatus = useAppSelector(selectLoadStatus);
  const { visible, total } = useAppSelector(selectResultCount);
  const selectedId = useAppSelector(selectSelectedShipmentId);
  const selectionSource = useAppSelector(selectSelectionSource);
  const selectionVersion = useAppSelector(selectSelectionVersion);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  // Clic en un marcador: la card ya se expandió en el store; acá solo se trae a la vista.
  useEffect(() => {
    if (selectionSource !== 'map' || !selectedId) return;
    cardRefs.current.get(selectedId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId, selectionSource, selectionVersion]);

  function registerCard(id: string, element: HTMLElement | null) {
    if (element) cardRefs.current.set(id, element);
    else cardRefs.current.delete(id);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-col gap-4 border-b border-line p-3 pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-body-loose font-semibold text-fg">Envíos en operación</h1>
          <p className="shrink-0 text-tiny font-light text-fg-soft" aria-live="polite">
            {loadStatus === 'succeeded' ? `${visible} de ${total} envíos` : ''}
          </p>
        </div>
        <ShipmentFilters />
        <ActiveFilterChips />
      </header>
      <div className="scrollbar-kit min-h-0 flex-1 overflow-y-auto p-3">
        <ShipmentList
          onLocate={onLocate}
          onOpenActions={onOpenActions}
          registerCard={registerCard}
        />
      </div>
    </div>
  );
}
