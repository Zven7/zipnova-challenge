import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

function SearchInputDemo({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return (
    <SearchInput
      label="Buscar por número, seguimiento, cliente o dirección"
      value={value}
      onChange={setValue}
    />
  );
}

const meta = {
  title: 'Otros componentes/Buscador',
  component: SearchInputDemo,
  decorators: [
    (Story) => (
      <div className="w-[378px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInputDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vacio: Story = { name: 'Vacío' };

export const ConTexto: Story = { name: 'Con texto', args: { initialValue: 'ferreteria' } };
