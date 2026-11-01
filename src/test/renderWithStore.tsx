import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { createLoadedStore } from './loadedStore';

export function renderWithStore(ui: ReactElement, store = createLoadedStore()) {
  const user = userEvent.setup();
  return { store, user, ...render(<Provider store={store}>{ui}</Provider>) };
}
