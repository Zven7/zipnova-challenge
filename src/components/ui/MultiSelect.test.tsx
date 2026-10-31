// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { MultiSelect } from './MultiSelect';

const options = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'assigned', label: 'Asignado' },
  { value: 'delivered', label: 'Entregado' },
];

function ControlledMultiSelect() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <>
      <MultiSelect label="Estado" options={options} value={value} onChange={setValue} />
      <output aria-label="Valor">{value.join(',')}</output>
    </>
  );
}

function setup() {
  const user = userEvent.setup();
  render(<ControlledMultiSelect />);
  const combobox = screen.getByRole('combobox', { name: 'Estado' });
  const selectedValue = () => screen.getByRole('status', { name: 'Valor' }).textContent;
  return { user, combobox, selectedValue };
}

describe('MultiSelect', () => {
  it('se abre y navega con flechas, y selecciona con Enter', async () => {
    const { user, combobox, selectedValue } = setup();
    await user.click(combobox);
    await user.keyboard('{Escape}');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowDown}');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(
      document.getElementById(combobox.getAttribute('aria-activedescendant') ?? ''),
    ).toHaveTextContent('Seleccionar todo');

    await user.keyboard('{ArrowDown}{Enter}');
    expect(selectedValue()).toBe('pending');
    expect(screen.getByRole('option', { name: 'Pendiente' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.keyboard('{End}{Enter}');
    expect(selectedValue()).toBe('pending,delivered');
  });

  it('filtra las opciones con la búsqueda y avisa cuando no hay resultados', async () => {
    const { user, combobox } = setup();
    await user.type(combobox, 'asig');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Seleccionar todo',
      'Asignado',
    ]);

    await user.clear(combobox);
    await user.type(combobox, 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('Sin opciones')).toBeInTheDocument();
  });

  it('"Seleccionar todo" alcanza solo a las opciones filtradas', async () => {
    const { user, combobox, selectedValue } = setup();
    await user.type(combobox, 'ado');
    await user.keyboard('{Home}{Enter}');
    expect(selectedValue()).toBe('assigned,delivered');

    await user.keyboard('{Enter}');
    expect(selectedValue()).toBe('');
  });

  it('Escape cierra la lista y, con la lista cerrada, borra la búsqueda', async () => {
    const { user, combobox } = setup();
    await user.type(combobox, 'pen');
    await user.keyboard('{Escape}');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveValue('pen');

    await user.keyboard('{Escape}');
    expect(combobox).toHaveValue('');
  });
});
