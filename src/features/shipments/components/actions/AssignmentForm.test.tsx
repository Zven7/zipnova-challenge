// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLoadedStore, TEST_TODAY } from '@/test/loadedStore';
import { renderWithStore } from '@/test/renderWithStore';
import { selectShipmentById } from '../../store/selectors';
import { AssignmentForm } from './AssignmentForm';

// 123445 es un envío pendiente con entrega hoy; ese día ya están en uso los cinco pares del mock.
// El formulario calcula "hoy" con el reloj: se fija en el mismo día que el mock.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

function setup(id = '123445') {
  const onDone = vi.fn();
  const store = createLoadedStore();
  const shipment = selectShipmentById(store.getState(), id);
  if (!shipment) throw new Error(`Falta el envío ${id} en el mock`);
  const rendered = renderWithStore(<AssignmentForm shipment={shipment} onDone={onDone} />, store);
  return {
    ...rendered,
    onDone,
    driver: screen.getByRole('combobox', { name: 'Conductor' }),
    vehicle: screen.getByRole('combobox', { name: 'Vehículo' }),
    submit: screen.getByRole('button', { name: /^(Asignar|Reasignar)$/ }),
  };
}

describe('AssignmentForm', () => {
  it('muestra un error por campo si se envía vacío', async () => {
    const { user, submit, driver, vehicle } = setup();
    await user.click(submit);

    expect(await screen.findByText('Elige un conductor.')).toBeInTheDocument();
    expect(screen.getByText('Elige un vehículo.')).toBeInTheDocument();
    expect(driver).toHaveAttribute('aria-invalid', 'true');
    expect(vehicle).toHaveAttribute('aria-invalid', 'true');
  });

  it('al elegir un conductor con envíos ese día propone su vehículo', async () => {
    const { user, driver, vehicle } = setup();
    await user.selectOptions(driver, 'drv-4');
    expect(vehicle).toHaveValue('veh-4');
  });

  it('rechaza un vehículo distinto del que el conductor ya usa ese día', async () => {
    const { user, driver, vehicle, submit, onDone } = setup();
    await user.selectOptions(driver, 'drv-4');
    await user.selectOptions(vehicle, 'veh-5');
    await user.click(submit);

    expect(
      await screen.findByText('Ese día el conductor ya usa Mercedes-Benz Sprinter (AG 910 LS).'),
    ).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('marca los vehículos en tránsito con otro envío', () => {
    const { vehicle } = setup();
    const renaultOption = Array.from((vehicle as HTMLSelectElement).options).find(
      (option) => option.value === 'veh-1',
    );
    expect(renaultOption?.textContent).toContain('(en tránsito)');
  });

  it('asigna y avisa al terminar', async () => {
    const { user, driver, submit, store, onDone } = setup();
    await user.selectOptions(driver, 'drv-4');
    await user.click(submit);

    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
    await waitFor(
      () => {
        expect(onDone).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
    expect(selectShipmentById(store.getState(), '123445')).toMatchObject({
      status: 'assigned',
      driverId: 'drv-4',
      vehicleId: 'veh-4',
    });
  });

  it('al reasignar, el botón espera a que cambie el conductor o el vehículo', async () => {
    // 123491 ya está asignado a Valeria Sosa con la Sprinter.
    const { user, driver, vehicle, submit } = setup('123491');
    expect(submit).toHaveTextContent('Reasignar');
    expect(submit).toBeDisabled();

    await user.selectOptions(driver, 'drv-5');
    expect(submit).toBeEnabled();

    // Volver al par original deja el formulario sin cambios.
    await user.selectOptions(driver, 'drv-4');
    await user.selectOptions(vehicle, 'veh-4');
    expect(submit).toBeDisabled();
  });
});
