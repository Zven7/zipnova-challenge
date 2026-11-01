import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { selectAllDrivers } from '@/features/drivers/store/selectors';
import { selectAllVehicles } from '@/features/vehicles/store/selectors';
import { describePairingConflict, getDayVehicleId, isDriverOnRoute } from '../../rules';
import { createAssignmentSchema, type AssignmentValues } from '../../schemas';
import { selectBusyVehicleIds, selectSameDayAssignments } from '../../store/selectors';
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
  const sameDayAssignments = useAppSelector((state) =>
    selectSameDayAssignments(state, shipment.id),
  );
  const schema = useMemo(
    () =>
      createAssignmentSchema({
        busyVehicleIds,
        sameDayAssignments,
        describeConflict: (conflict) => describePairingConflict(conflict, drivers, vehicles),
      }),
    [busyVehicleIds, sameDayAssignments, drivers, vehicles],
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<AssignmentValues>({
    resolver: zodResolver(schema),
    defaultValues: { driverId: shipment.driverId ?? '', vehicleId: shipment.vehicleId ?? '' },
  });
  const runAction = useActionFeedback(setError, onDone);
  const selectedDriverId = useWatch({ control, name: 'driverId' });
  const isReassignment = shipment.driverId !== undefined;

  function getVehicleNote(vehicleId: string): string {
    if (busyVehicleIds.includes(vehicleId)) return ' (en tránsito)';
    const dayDriverId = sameDayAssignments.find((other) => other.vehicleId === vehicleId)?.driverId;
    if (!dayDriverId || dayDriverId === selectedDriverId) return '';
    const driverName = drivers.find((driver) => driver.id === dayDriverId)?.name;
    return driverName ? ` (ese día con ${driverName})` : '';
  }

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
            {...register('driverId', {
              // Si el conductor ya tiene envíos ese día, se propone el vehículo que usa (si está libre).
              onChange: (event: { target: { value: string } }) => {
                const dayVehicleId = getDayVehicleId(event.target.value, sameDayAssignments);
                if (dayVehicleId && !busyVehicleIds.includes(dayVehicleId)) {
                  setValue('vehicleId', dayVehicleId, { shouldValidate: isSubmitted });
                }
              },
            })}
            placeholder="Elige un conductor"
            options={drivers.map((driver) => ({
              value: driver.id,
              label: `${driver.name} · ${driver.phone}${
                isDriverOnRoute(driver.id, sameDayAssignments, busyVehicleIds)
                  ? ' (ese día ya salió)'
                  : ''
              }`,
            }))}
          />
        )}
      </FormField>
      <FormField
        id="assign-vehicle"
        label="Vehículo"
        error={errors.vehicleId?.message}
        hint="Cada conductor usa un solo vehículo por día. Un vehículo en tránsito ese día no se puede asignar hasta que vuelva."
      >
        {(control) => (
          <Select
            {...control}
            {...register('vehicleId')}
            placeholder="Elige un vehículo"
            options={vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.model} · ${vehicle.plate} · ${vehicle.capacityKg} kg${getVehicleNote(vehicle.id)}`,
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
