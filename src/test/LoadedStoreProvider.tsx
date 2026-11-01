import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import type { AppStore } from '@/app/store';
import { createLoadedStore } from './loadedStore';

type LoadedStoreProviderProps = {
  /** Ajusta el store recién creado (expandir o seleccionar un envío, por ejemplo). */
  setup?: (store: AppStore) => void;
  children: ReactNode;
};

/** Store propio con el mock cargado y fechas relativas a hoy, para las stories. */
export function LoadedStoreProvider({ setup, children }: LoadedStoreProviderProps) {
  const [store] = useState(() => {
    const created = createLoadedStore(new Date());
    setup?.(created);
    return created;
  });
  return <Provider store={store}>{children}</Provider>;
}
