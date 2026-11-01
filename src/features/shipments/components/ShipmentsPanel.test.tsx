// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithStore } from '@/test/renderWithStore';
import {
  selectFilteredShipments,
  selectSelectedShipmentId,
  selectSelectionSource,
} from '../store/selectors';
import { ShipmentsPanel } from './ShipmentsPanel';

function setup() {
  const onLocate = vi.fn();
  const rendered = renderWithStore(
    <ShipmentsPanel onLocate={onLocate} onOpenActions={() => undefined} />,
  );
  const cardTitles = () =>
    screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
  // El mapa dibuja un marcador por cada envío de este selector.
  const mapShipmentIds = () =>
    selectFilteredShipments(rendered.store.getState()).map(({ id }) => `Entrega ${id}`);
  return { ...rendered, onLocate, cardTitles, mapShipmentIds };
}

describe('ShipmentsPanel', () => {
  it('filtra por estado, muestra el chip y la lista coincide con lo que dibuja el mapa', async () => {
    const { user, cardTitles, mapShipmentIds } = setup();
    expect(screen.getByText('20 de 20 envíos')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Estado' }));
    await user.click(screen.getByRole('option', { name: 'Pendiente' }));

    expect(screen.getByText('5 de 20 envíos')).toBeInTheDocument();
    expect(cardTitles()).toEqual(mapShipmentIds());
    expect(cardTitles()).toHaveLength(5);

    const chips = screen.getByRole('group', { name: 'Filtros activos' });
    await user.click(
      within(chips).getByRole('button', { name: 'Quitar filtro Estado: Pendiente' }),
    );
    expect(screen.getByText('20 de 20 envíos')).toBeInTheDocument();
  });

  it('muestra el estado vacío y "Limpiar filtros" restablece la lista', async () => {
    const { user } = setup();
    await user.type(
      screen.getByRole('searchbox', { name: /^Buscar por número/ }),
      'no existe ningún envío así',
    );

    expect(screen.getByText('Ningún envío coincide con los filtros')).toBeInTheDocument();
    expect(screen.getByText('0 de 20 envíos')).toBeInTheDocument();

    const emptyState = screen.getByText('Ningún envío coincide con los filtros').parentElement;
    if (!emptyState) throw new Error('Falta el estado vacío');
    await user.click(within(emptyState).getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByText('20 de 20 envíos')).toBeInTheDocument();
  });

  it('al quitar un chip el foco pasa al siguiente, y al buscador cuando no quedan', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('combobox', { name: 'Estado' }));
    await user.click(screen.getByRole('option', { name: 'Pendiente' }));
    await user.click(screen.getByRole('option', { name: 'Asignado' }));
    await user.keyboard('{Escape}');

    const chips = screen.getByRole('group', { name: 'Filtros activos' });
    await user.click(
      within(chips).getByRole('button', { name: 'Quitar filtro Estado: Pendiente' }),
    );
    expect(
      within(chips).getByRole('button', { name: 'Quitar filtro Estado: Asignado' }),
    ).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('searchbox', { name: /^Buscar por número/ })).toHaveFocus();
  });

  it('"Limpiar filtros" del estado vacío deja el foco en el buscador', async () => {
    const { user } = setup();
    const search = screen.getByRole('searchbox', { name: /^Buscar por número/ });
    await user.type(search, 'zzzz');
    const emptyState = screen.getByText('Ningún envío coincide con los filtros').parentElement;
    if (!emptyState) throw new Error('Falta el estado vacío');

    await user.click(within(emptyState).getByRole('button', { name: 'Limpiar filtros' }));
    expect(search).toHaveFocus();
  });

  it('"Ubicar en el mapa" selecciona el envío desde la lista', async () => {
    const { user, store, onLocate } = setup();
    await user.click(screen.getByRole('button', { name: 'Ubicar la entrega 123445 en el mapa' }));

    expect(selectSelectedShipmentId(store.getState())).toBe('123445');
    expect(selectSelectionSource(store.getState())).toBe('list');
    expect(onLocate).toHaveBeenCalled();
  });
});
