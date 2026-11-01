// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'a', label: 'Asignación' },
  { value: 'b', label: 'Estado' },
  { value: 'c', label: 'Cancelar' },
];

function Demo() {
  const [value, setValue] = useState('a');
  return <SegmentedControl label="Acción" options={options} value={value} onChange={setValue} />;
}

describe('SegmentedControl', () => {
  it('solo la opción elegida recibe Tab', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Asignación' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Estado' })).not.toHaveFocus();
  });

  it('las flechas, Home y End mueven la selección y el foco, en círculo', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();

    await user.keyboard('{ArrowRight}');
    const estado = screen.getByRole('radio', { name: 'Estado' });
    expect(estado).toHaveFocus();
    expect(estado).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Cancelar' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Asignación' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Cancelar' })).toHaveFocus();
  });
});
