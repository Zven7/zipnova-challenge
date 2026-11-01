import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { App } from './App';
import { store } from './app/store';
import { Button } from './components/ui/Button';
import { EmptyState } from './components/ui/EmptyState';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './index.css';

// La fuente se precarga en index.html; aplicarla desde acá evita un handler inline, que la CSP bloquea.
const fontLink = document.getElementById('font-stylesheet');
if (fontLink instanceof HTMLLinkElement) fontLink.rel = 'stylesheet';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento #root');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary
      fallback={() => (
        <main className="flex h-full items-center justify-center p-6">
          <EmptyState
            title="Algo salió mal."
            description="Recarga la página para volver a intentarlo."
            action={
              <Button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Recargar
              </Button>
            }
          />
        </main>
      )}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
