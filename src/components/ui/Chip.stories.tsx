import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Chip } from './Chip';

const meta = {
  title: 'Otros componentes/Chip de filtro',
  component: Chip,
  args: { label: 'Estado: Pendiente', onRemove: fn() },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PorDefecto: Story = { name: 'Por defecto' };

export const TextoLargo: Story = {
  name: 'Texto largo',
  args: { label: 'Dirección: Av. Corrientes 1234, San Nicolás, CABA' },
};
