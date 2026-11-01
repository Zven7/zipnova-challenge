import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Toaster } from '@/features/notifications/Toaster';
import { LoadedStoreProvider } from '@/test/LoadedStoreProvider';
import { ShipmentActionsDialog } from './ShipmentActionsDialog';

type DemoProps = { id: string };

/** El diálogo con el store real: valida, guarda con el delay simulado y muestra el toast. */
function ActionsDemo({ id }: DemoProps) {
  const [open, setOpen] = useState(true);
  return (
    <LoadedStoreProvider>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Abrir acciones
      </Button>
      {open && (
        <ShipmentActionsDialog
          id={id}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
      <Toaster />
    </LoadedStoreProvider>
  );
}

const meta = {
  title: 'Otros componentes/Acciones del envío',
  component: ActionsDemo,
} satisfies Meta<typeof ActionsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pendiente: Story = { name: 'Envío pendiente (asignar)', args: { id: '123445' } };

export const Asignado: Story = {
  name: 'Envío asignado (reasignar, despachar o cancelar)',
  args: { id: '123491' },
};

export const AsignadoFuturo: Story = {
  name: 'Envío asignado para pasado mañana (no se despacha)',
  args: { id: '123537' },
};

export const EnTransito: Story = { name: 'Envío en tránsito', args: { id: '123542' } };
