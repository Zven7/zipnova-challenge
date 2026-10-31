import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Los tests de lógica corren en Node; los de componentes, en jsdom (lo declaran en su primera línea).
if (typeof Element !== 'undefined') {
  // jsdom no implementa scroll; los componentes lo usan para traer opciones y cards a la vista.
  Element.prototype.scrollIntoView = () => undefined;
}

afterEach(() => {
  cleanup();
});
