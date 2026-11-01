import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Otros componentes/Estado vacío',
  component: EmptyState,
  decorators: [
    (Story) => (
      <div className="w-[378px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SinResultados: Story = {
  name: 'Sin resultados',
  args: {
    title: 'No hay envíos que coincidan con los filtros.',
    description: 'Prueba con otros filtros o límpialos para ver todos los envíos.',
    action: (
      <Button variant="secondary" onClick={fn()}>
        Limpiar filtros
      </Button>
    ),
  },
};

export const ErrorDeCarga: Story = {
  name: 'Error de carga',
  args: {
    title: 'No pudimos cargar los envíos.',
    description: 'Revisa tu conexión e intenta de nuevo.',
    action: <Button onClick={fn()}>Reintentar</Button>,
  },
};
