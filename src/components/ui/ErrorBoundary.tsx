import { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  /** Se muestra en lugar de `children` cuando fallan; `reset` vuelve a intentar renderizarlos. */
  fallback: (reset: () => void) => ReactNode;
  /** Se llama antes de reintentar, para preparar lo que haga falta (por ejemplo, un nuevo `lazy`). */
  onReset?: () => void;
  children: ReactNode;
};

type ErrorBoundaryState = { hasError: boolean };

/**
 * Atrapa los errores de render de `children`, incluida la descarga fallida de un componente
 * diferido, para que no dejen toda la pantalla en blanco.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  render() {
    return this.state.hasError ? this.props.fallback(this.reset) : this.props.children;
  }
}
