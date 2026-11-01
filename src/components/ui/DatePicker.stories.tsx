import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { KIT_DATE, KIT_TODAY } from './storyData';

type DemoProps = { initialValue?: string };

function DatePickerDemo({ initialValue }: DemoProps) {
  const [value, setValue] = useState(initialValue);
  return <DatePicker label="Fecha" value={value} onChange={setValue} today={KIT_TODAY} />;
}

const meta = {
  title: 'Kit de Figma/Filtro/Date picker',
  component: DatePickerDemo,
  decorators: [
    (Story) => (
      <div className="w-[340px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SinSeleccion: Story = { name: 'Sin selección' };

export const ConFechaElegida: Story = {
  name: 'Con fecha elegida',
  args: { initialValue: KIT_DATE },
};
