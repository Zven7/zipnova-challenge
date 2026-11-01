import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'assign', label: 'Asignación' },
  { value: 'status', label: 'Estado' },
  { value: 'cancel', label: 'Cancelar' },
];

function SegmentedControlDemo() {
  const [value, setValue] = useState('assign');
  return <SegmentedControl label="Acción" options={options} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Otros componentes/Control segmentado',
  component: SegmentedControlDemo,
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SegmentedControlDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PorDefecto: Story = { name: 'Por defecto' };
