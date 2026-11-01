import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useAppDispatch } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { TextArea } from '@/components/ui/TextArea';
import { cancelSchema, REASON_MAX_LENGTH, type CancelValues } from '../../schemas';
import { cancelShipment } from '../../store/thunks';
import type { Shipment } from '../../types';
import { FormError } from './FormError';
import { useActionFeedback } from './useActionFeedback';

type CancelFormProps = {
  shipment: Shipment;
  onDone: () => void;
};

export function CancelForm({ shipment, onDone }: CancelFormProps) {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CancelValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: '', confirmed: false },
  });
  const runAction = useActionFeedback(setError, onDone);
  const reasonLength = useWatch({ control, name: 'reason' }).length;

  const onSubmit = handleSubmit(async ({ reason }) => {
    await runAction(
      () => dispatch(cancelShipment({ id: shipment.id, reason })).unwrap(),
      `Entrega ${shipment.id} cancelada.`,
    );
  });

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
      <FormField
        id="cancel-reason"
        label="Motivo (opcional)"
        error={errors.reason?.message}
        hint={`${reasonLength}/${REASON_MAX_LENGTH} caracteres`}
      >
        {(control) => (
          <TextArea
            {...control}
            {...register('reason')}
            maxLength={REASON_MAX_LENGTH}
            placeholder="Ej.: el cliente reprogramó la entrega"
          />
        )}
      </FormField>
      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-2 text-small font-light text-fg">
          <input
            type="checkbox"
            {...register('confirmed')}
            aria-invalid={errors.confirmed !== undefined}
            aria-describedby={errors.confirmed ? 'cancel-confirm-error' : undefined}
            className="mt-0.5 size-4 accent-status-cancelled"
          />
          Confirmo que quiero cancelar la entrega {shipment.id}. Esta acción no se puede deshacer.
        </label>
        {errors.confirmed?.message && (
          <p id="cancel-confirm-error" className="text-tiny font-light text-status-cancelled">
            {errors.confirmed.message}
          </p>
        )}
      </div>
      <FormError message={errors.root?.message} />
      <Button type="submit" variant="danger" disabled={isSubmitting} className="self-end">
        {isSubmitting ? 'Cancelando…' : 'Cancelar envío'}
      </Button>
    </form>
  );
}
