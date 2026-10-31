import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { selectAllDrivers } from '@/features/drivers/store/selectors';
import { selectAllVehicles } from '@/features/vehicles/store/selectors';
import { createAssignmentSchema, type AssignmentValues } from '../../schemas';
import { selectBusyVehicleIds } from '../../store/selectors';
import { assignShipment } from '../../store/thunks';
import type { Shipment } from '../../types';
import { FormError } from './FormError';
import { useActionFeedback } from './useActionFeedback';

type AssignmentFormProps = {
  shipment: Shipment;
  onDone: () => void;
};

export function AssignmentForm({ shipment, onDone }: AssignmentFormProps) {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const vehicles = useAppSelector(selectAllVehicles);
  const busyVehicleIds = useAppSelector((state) => selectBusyVehicleIds(state, shipment.id));
  const schema = useMemo(() => createAssignmentSchema(busyVehicleIds), [busyVehicleIds]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentValues>({
    resolver: zodResolver(schema),
    defaultValues: { driverId: shipment.driverId ?? '', vehicleId: shipment.vehicleId ?? '' },
  });
  const runAction = useActionFeedback(setError, onDone);
  const isReassignment = shipment.driverId !== undefined;

  const onSubmit = handleSubmit(async ({ driverId, vehicleId }) => {
    const driverName = drivers.find((driver) => driver.id === driverId)?.name ?? 'el conductor';
    await runAction(
      () => dispatch(assignShipment({ id: shipment.id, driverId, vehicleId })).unwrap(),
      `Entrega ${shipment.id} ${isReassignment ? 'reasignada' : 'asignada'} a ${driverName}.`,
    );
  });

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
      <FormField id="assign-driver" label="Conductor" error={errors.driverId?.message}>
        {(control) => (
          <Select
            {...control}
            {...register('driverId')}
            placeholder="Elige un conductor"
            options={drivers.map((driver) => ({
              value: driver.id,
              label: `${driver.name} · ${driver.phone}`,
            }))}
          />
        )}
      </FormField>
      <FormField
        id="assign-vehicle"
        label="Vehículo"
        error={errors.vehicleId?.message}
        hint="Los vehículos en tránsito con otro envío no se pueden asignar."
      >
        {(control) => (
          <Select
            {...control}
            {...register('vehicleId')}
            placeholder="Elige un vehículo"
            options={vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.model} · ${vehicle.plate} · ${vehicle.capacityKg} kg${
                busyVehicleIds.includes(vehicle.id) ? ' (en tránsito)' : ''
              }`,
            }))}
          />
        )}
      </FormField>
      <FormError message={errors.root?.message} />
      <Button type="submit" disabled={isSubmitting} className="self-end">
        {isSubmitting ? 'Guardando…' : isReassignment ? 'Reasignar' : 'Asignar'}
      </Button>
    </form>
  );
}
