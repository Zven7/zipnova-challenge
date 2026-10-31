import { lazy, Suspense, useSyncExternalStore } from 'react';
import { OperationView } from './features/shipments/components/OperationView';

const ExamplesPage = lazy(() =>
  import('./dev/ExamplesPage').then((module) => ({ default: module.ExamplesPage })),
);

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
  };
}

const getHash = () => window.location.hash;

export function App() {
  const hash = useSyncExternalStore(subscribeToHash, getHash);

  if (hash === '#dev') {
    return (
      <Suspense fallback={null}>
        <ExamplesPage />
      </Suspense>
    );
  }

  return <OperationView />;
}
