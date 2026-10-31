import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectLoadStatus, selectResultCount } from './features/shipments/store/selectors';
import { fetchOperationData } from './features/shipments/store/thunks';

export function App() {
  const dispatch = useAppDispatch();
  const loadStatus = useAppSelector(selectLoadStatus);
  const { visible, total } = useAppSelector(selectResultCount);

  useEffect(() => {
    void dispatch(fetchOperationData());
  }, [dispatch]);

  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <h1 className="text-heading font-semibold">Envíos en operación</h1>
      <p className="text-fg-soft">
        {loadStatus === 'succeeded' ? `${visible} de ${total} envíos` : 'Cargando envíos…'}
      </p>
    </main>
  );
}
