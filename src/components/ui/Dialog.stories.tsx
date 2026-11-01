import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';

function DialogDemo() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Abrir diálogo
      </Button>
      {open && (
        <Dialog
          title="Acciones de la entrega 123445"
          description="Se cierra con Escape, con la X o haciendo clic afuera."
          onClose={() => {
            setOpen(false);
          }}
        >
          <p className="text-small font-light text-fg-soft">Contenido del diálogo.</p>
        </Dialog>
      )}
    </>
  );
}

const meta = {
  title: 'Otros componentes/Diálogo',
  component: DialogDemo,
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PorDefecto: Story = { name: 'Por defecto' };
