// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { Dialog } from './Dialog';

// jsdom no implementa el modal nativo; alcanza con abrir y cerrar.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        Abrir
      </button>
      {open && (
        <Dialog
          title="Acciones"
          description="Pendiente · Ferretería El Tornillo"
          onClose={() => {
            setOpen(false);
          }}
        >
          <p>Contenido</p>
        </Dialog>
      )}
    </>
  );
}

describe('Dialog', () => {
  it('anuncia título y descripción', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByRole('dialog', { name: 'Acciones' })).toHaveAccessibleDescription(
      'Pendiente · Ferretería El Tornillo',
    );
  });

  it('al cerrarse devuelve el foco al botón que lo abrió', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    await user.click(opener);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
