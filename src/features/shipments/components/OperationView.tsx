import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { useMediaQuery } from '@/components/ui/useMediaQuery';
import { cn } from '@/lib/cn';
import { focusShipment } from '../store/shipmentsViewSlice';
import { fetchOperationData } from '../store/thunks';
import { ShipmentMap } from './ShipmentMap';
import { ShipmentsPanel } from './ShipmentsPanel';

type Tab = 'list' | 'map';

const tabs: { id: Tab; label: string }[] = [
  { id: 'list', label: 'Lista' },
  { id: 'map', label: 'Mapa' },
];

/** Pantalla principal: panel con búsqueda, filtros y lista a la izquierda; mapa a la derecha. */
export function OperationView() {
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [tab, setTab] = useState<Tab>('list');
  const [, setActionsShipmentId] = useState<string>();

  useEffect(() => {
    void dispatch(fetchOperationData());
  }, [dispatch]);

  const showList = isDesktop || tab === 'list';
  const showMap = isDesktop || tab === 'map';

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div
        role="tablist"
        aria-label="Vista"
        className="flex gap-1 border-b border-line p-2 lg:hidden"
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => {
              setTab(id);
            }}
            className={cn(
              'h-8 flex-1 rounded-full text-small font-semibold transition-colors',
              tab === id ? 'bg-surface-raised text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <aside
        id="panel-list"
        role={isDesktop ? undefined : 'tabpanel'}
        aria-labelledby={isDesktop ? undefined : 'tab-list'}
        className={cn(
          'min-h-0 flex-1 bg-bg lg:w-[402px] lg:flex-none lg:border-r lg:border-line',
          !showList && 'hidden',
        )}
      >
        <ShipmentsPanel
          onLocate={() => {
            setTab('map');
          }}
          onOpenActions={setActionsShipmentId}
        />
      </aside>

      <section
        id="panel-map"
        role={isDesktop ? undefined : 'tabpanel'}
        aria-labelledby={isDesktop ? undefined : 'tab-map'}
        aria-label={isDesktop ? 'Mapa de envíos' : undefined}
        className={cn('relative min-h-0 flex-1', !showMap && 'hidden')}
      >
        <ShipmentMap
          visible={showMap}
          onShowInList={(id) => {
            dispatch(focusShipment(id));
            setTab('list');
          }}
        />
      </section>
    </div>
  );
}
