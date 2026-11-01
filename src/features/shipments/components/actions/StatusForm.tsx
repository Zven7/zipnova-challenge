import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { STATUS_LABELS } from '../../constants';
import { canDispatch, getNextStatus } from '../../rules';
import { createStatusSchema, type StatusValues } from '../../schemas';
import { changeShipmentStatus } from '../../store/thunks';
import type { Shipment, ShipmentStatus } from '../../types';
import { FormError } from './FormError';
import { useActionFeedback } from './useActionFeedback';

const FLOW: ShipmentStatus[] = ['pending', 'assigned', 'in_transit', 'delivered'];

type StatusFormProps = {
  shipment: Shipment;
  onDone: () => void;
};

export function StatusForm({ shipment, onDone }: StatusFormProps) {
  const dispatch = useAppDispatch();
  const next = getNextStatus(shipment.status);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StatusValues>({
    resolver: zodResolver(createStatusSchema(shipment.status)),
    defaultValues: next && next !== 'assigned' ? { status: next } : undefined,
  });
  const runAction = useActionFeedback(setError, onDone);

  if (next === 'assigned') {
    return (
      <p className="text-small font-light text-fg-soft">
        Para pasar a <strong className="font-semibold text-fg">Asignado</strong>, asigna un
        conductor y un vehículo en la pestaña Asignación.
      </p>
    );
  }

  if (next === 'in_transit' && !canDispatch(shipment, new Date())) {
    return (
      <p className="text-small font-light text-fg-soft">
        Este envío pasa a <strong className="font-semibold text-fg">En tránsito</strong> el día de
        su entrega. Todavía no se puede despachar.
      </p>
    );
  }

  const onSubmit = handleSubmit(async ({ status }) => {
    await runAction(
      () => dispatch(changeShipmentStatus({ id: shipment.id, status })).unwrap(),
      `Entrega ${shipment.id}: ${STATUS_LABELS[status].toLowerCase()}.`,
    );
  });

  const currentIndex = FLOW.indexOf(shipment.status);

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2" aria-describedby="status-help">
        <legend className="mb-2 text-small font-light text-fg">Nuevo estado</legend>
        {FLOW.map((status, index) => {
          const enabled = status === next;
          return (
            <label
              key={status}
              className={cn(
                'flex h-10 items-center gap-3 rounded-md border px-3 text-small font-light',
                enabled
                  ? 'cursor-pointer border-line bg-surface-raised text-fg has-[:checked]:border-primary'
                  : 'border-transparent text-fg-faint',
              )}
            >
              <input
                type="radio"
                value={status}
                disabled={!enabled}
                {...register('status')}
                className="size-4 accent-primary"
              />
              {STATUS_LABELS[status]}
              {status === shipment.status && (
                <span className="ml-auto text-tiny text-fg-muted">Estado actual</span>
              )}
              {index < currentIndex && <span className="ml-auto text-tiny">Completado</span>}
            </label>
          );
        })}
      </fieldset>
      <p id="status-help" className="text-tiny font-light text-fg-soft">
        El flujo es Pendiente → Asignado → En tránsito → Entregado, sin saltear pasos.
      </p>
      {errors.status?.message && (
        <p className="text-tiny font-light text-status-cancelled">{errors.status.message}</p>
      )}
      <FormError message={errors.root?.message} />
      <Button type="submit" disabled={isSubmitting} className="self-end">
        {isSubmitting ? 'Guardando…' : 'Cambiar estado'}
      </Button>
    </form>
  );
}
