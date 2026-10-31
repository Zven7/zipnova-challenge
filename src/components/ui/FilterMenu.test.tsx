// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FilterMenu, type FilterMenuItem } from './FilterMenu';

const items: FilterMenuItem[] = [
  {
    id: 'address',
    label: 'Dirección',
    icon: 'locate',
    render: () => <input aria-label="Buscar dirección" />,
  },
  {
    id: 'date',
    label: 'Fecha',
    icon: 'calendar',
    render: ({ close }) => (
      <button type="button" onClick={close}>
        Aplicar
      </button>
    ),
  },
];

function setup() {
  const user = userEvent.setup();
  render(<FilterMenu label="Filtrar" items={items} />);
  const button = screen.getByRole('button', { name: 'Filtrar' });
  return { user, button };
}

describe('FilterMenu', () => {
  it('se abre con el teclado y recorre los ítems con flechas', async () => {
    const { user, button } = setup();
    button.focus();
    await user.keyboard('{ArrowDown}');

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Dirección' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Fecha' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Dirección' })).toHaveFocus();
  });

  it('ArrowRight entra al submenú y Escape vuelve al ítem y después cierra', async () => {
    const { user, button } = setup();
    button.focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');

    expect(screen.getByRole('dialog', { name: 'Dirección' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar dirección' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Dirección' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('el submenú puede cerrar todo el menú y devuelve el foco al botón', async () => {
    const { user, button } = setup();
    await user.click(button);
    await user.click(screen.getByRole('menuitem', { name: 'Fecha' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('se cierra al hacer clic afuera', async () => {
    const { user, button } = setup();
    await user.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
