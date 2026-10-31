import { Suspense, useEffect, useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useRetryableLazy } from '@/components/ui/useRetryableLazy';
import { useMediaQuery } from '@/components/ui/useMediaQuery';
import { cn } from '@/lib/cn';
import { Toaster } from '@/features/notifications/Toaster';
import { focusShipment } from '../store/shipmentsViewSlice';
import { fetchOperationData } from '../store/thunks';
import { ShipmentsPanel } from './ShipmentsPanel';

// Leaflet va en un chunk aparte para que la lista aparezca antes.
const loadShipmentMap = () =>
  import('./ShipmentMap').then((module) => ({ default: module.ShipmentMap }));
// Los formularios (React Hook Form + Zod) solo se descargan al abrir las acciones.
const loadActionsDialog = () =>
  import('./actions/ShipmentActionsDialog').then((module) => ({
    default: module.ShipmentActionsDialog,
  }));

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
  const [actionsShipmentId, setActionsShipmentId] = useState<string>();
  const [ShipmentMap, retryShipmentMap] = useRetryableLazy(loadShipmentMap);
  const [ShipmentActionsDialog, retryActionsDialog] = useRetryableLazy(loadActionsDialog);

  useEffect(() => {
    void dispatch(fetchOperationData());
  }, [dispatch]);

  function closeActions() {
    setActionsShipmentId(undefined);
  }

  const showList = isDesktop || tab === 'list';
  const showMap = isDesktop || tab === 'map';

  return (
    <main className="flex h-full flex-col lg:flex-row">
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

      <section
        id="panel-list"
        role={isDesktop ? undefined : 'tabpanel'}
        aria-labelledby={isDesktop ? undefined : 'tab-list'}
        aria-label={isDesktop ? 'Lista de envíos' : undefined}
        className={cn(
          'relative z-10 min-h-0 flex-1 bg-bg lg:w-[402px] lg:flex-none lg:border-r lg:border-line',
          !showList && 'hidden',
        )}
      >
        <ShipmentsPanel
          onLocate={() => {
            setTab('map');
          }}
          onOpenActions={setActionsShipmentId}
        />
      </section>

      <section
        id="panel-map"
        role={isDesktop ? undefined : 'tabpanel'}
        aria-labelledby={isDesktop ? undefined : 'tab-map'}
        aria-label={isDesktop ? 'Mapa de envíos' : undefined}
        className={cn('relative z-0 min-h-0 flex-1', !showMap && 'hidden')}
      >
        <ErrorBoundary
          onReset={retryShipmentMap}
          fallback={(reset) => (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                title="No pudimos cargar el mapa."
                description="La lista sigue funcionando. Revisa tu conexión e intenta de nuevo."
                action={<Button onClick={reset}>Reintentar</Button>}
              />
            </div>
          )}
        >
          <Suspense
            fallback={
              <div aria-label="Cargando mapa" className="h-full w-full animate-pulse bg-surface" />
            }
          >
            <ShipmentMap
              visible={showMap}
              onShowInList={(id) => {
                dispatch(focusShipment(id));
                setTab('list');
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </section>

      {actionsShipmentId && (
        <ErrorBoundary
          onReset={retryActionsDialog}
          fallback={(reset) => (
            <Dialog title="No pudimos abrir las acciones" onClose={closeActions}>
              <p className="text-small font-light text-fg-soft">
                Revisa tu conexión e intenta de nuevo.
              </p>
              <Button onClick={reset} className="self-end">
                Reintentar
              </Button>
            </Dialog>
          )}
        >
          <Suspense fallback={null}>
            <ShipmentActionsDialog id={actionsShipmentId} onClose={closeActions} />
          </Suspense>
        </ErrorBoundary>
      )}
      <Toaster />
    </main>
  );
}
