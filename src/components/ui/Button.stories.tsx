import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Otros componentes/Button',
  component: Button,
  args: { children: 'Asignar', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = {};

export const Secundario: Story = { args: { variant: 'secondary', children: 'Limpiar filtros' } };

export const Fantasma: Story = { args: { variant: 'ghost', children: 'Ver en la lista' } };

export const Peligro: Story = { args: { variant: 'danger', children: 'Cancelar envío' } };

export const Deshabilitado: Story = { args: { disabled: true, children: 'Guardando…' } };
