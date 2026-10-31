import { z } from 'zod';
import { canTransition, VEHICLE_BUSY_MESSAGE } from './rules';
import { SHIPMENT_STATUSES, type ShipmentStatus } from './types';

export const REASON_MAX_LENGTH = 200;

/** Conductor y vehículo son obligatorios; el vehículo no puede estar en tránsito con otro envío. */
export function createAssignmentSchema(busyVehicleIds: string[]) {
  return z.object({
    driverId: z.string().min(1, { error: 'Elige un conductor.' }),
    vehicleId: z
      .string()
      .min(1, { error: 'Elige un vehículo.' })
      .refine((vehicleId) => !busyVehicleIds.includes(vehicleId), { error: VEHICLE_BUSY_MESSAGE }),
  });
}

export type AssignmentValues = z.infer<ReturnType<typeof createAssignmentSchema>>;

export function createStatusSchema(current: ShipmentStatus) {
  return z.object({
    status: z
      .enum(SHIPMENT_STATUSES, { error: 'Elige el nuevo estado.' })
      .refine((status) => status !== 'cancelled' && canTransition(current, status), {
        error: 'Ese cambio de estado no está permitido.',
      }),
  });
}

export type StatusValues = z.infer<ReturnType<typeof createStatusSchema>>;

export const cancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(REASON_MAX_LENGTH, {
      error: `El motivo puede tener hasta ${REASON_MAX_LENGTH} caracteres.`,
    }),
  confirmed: z
    .boolean()
    .refine((value) => value, { error: 'Confirma que quieres cancelar el envío.' }),
});

export type CancelValues = z.infer<typeof cancelSchema>;
