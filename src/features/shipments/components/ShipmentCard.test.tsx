// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithStore } from '@/test/renderWithStore';
import { selectSelectedShipmentId } from '../store/selectors';
import { ShipmentCard } from './ShipmentCard';

function setup() {
  const onLocate = vi.fn();
  const rendered = renderWithStore(
    <ShipmentCard id="123445" onLocate={onLocate} onOpenActions={() => undefined} />,
  );
  const toggle = () => screen.getByRole('button', { name: /detalle$/ });
  return { ...rendered, onLocate, toggle };
}

describe('ShipmentCard', () => {
  it('abre y cierra el detalle con un clic en la fila del título', async () => {
    const { user, toggle } = setup();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('heading', { name: 'Entrega 123445' }));
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('list', { name: 'Paquetes' })).toBeInTheDocument();

    await user.click(screen.getByText('0999-2234908283'));
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('"Ubicar" no abre el detalle y la flecha lo abre una sola vez', async () => {
    const { user, store, onLocate, toggle } = setup();

    await user.click(screen.getByRole('button', { name: 'Ubicar la entrega 123445 en el mapa' }));
    expect(onLocate).toHaveBeenCalledOnce();
    expect(selectSelectedShipmentId(store.getState())).toBe('123445');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
  });

  it('cada clic alterna, también en un doble clic sobre el mismo texto', async () => {
    const { user, toggle } = setup();
    const title = screen.getByRole('heading', { name: 'Entrega 123445' });

    await user.dblClick(title);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');

    await user.click(title);
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    await user.click(title);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('no cambia si se arrastra para seleccionar texto', async () => {
    const { user, toggle } = setup();
    const tracking = screen.getByText('0999-2234908283');

    await user.pointer([
      { keys: '[MouseLeft>]', target: tracking, coords: { clientX: 10, clientY: 10 } },
      { target: tracking, coords: { clientX: 60, clientY: 10 } },
      { keys: '[/MouseLeft]', target: tracking, coords: { clientX: 60, clientY: 10 } },
    ]);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });
});
