import { z } from 'zod';
import {
  canTransition,
  DRIVER_ON_ROUTE_MESSAGE,
  getPairingConflict,
  isDriverOnRoute,
  VEHICLE_BUSY_MESSAGE,
  type Assignment,
  type PairingConflict,
} from './rules';
import { SHIPMENT_STATUSES, type ShipmentStatus } from './types';

// Sin compilar validadores con `new Function`: la CSP de producción no permite eval.
z.config({ jitless: true });

export const REASON_MAX_LENGTH = 200;

type AssignmentContext = {
  busyVehicleIds: string[];
  sameDayAssignments: Assignment[];
  describeConflict: (conflict: PairingConflict) => string;
};

/**
 * Conductor y vehículo son obligatorios; el conductor no puede haber salido ya ese día, el vehículo
 * no puede estar en tránsito con otro envío y el par tiene que ser coherente con los demás envíos
 * del día.
 */
export function createAssignmentSchema({
  busyVehicleIds,
  sameDayAssignments,
  describeConflict,
}: AssignmentContext) {
  return z
    .object({
      driverId: z.string().min(1, { error: 'Elige un conductor.' }),
      vehicleId: z
        .string()
        .min(1, { error: 'Elige un vehículo.' })
        .refine((vehicleId) => !busyVehicleIds.includes(vehicleId), {
          error: VEHICLE_BUSY_MESSAGE,
        }),
    })
    .superRefine((assignment, ctx) => {
      if (
        assignment.driverId &&
        isDriverOnRoute(assignment.driverId, sameDayAssignments, busyVehicleIds)
      ) {
        ctx.addIssue({ code: 'custom', message: DRIVER_ON_ROUTE_MESSAGE, path: ['driverId'] });
        return;
      }
      if (!assignment.driverId || !assignment.vehicleId) return;
      if (busyVehicleIds.includes(assignment.vehicleId)) return;
      const conflict = getPairingConflict(assignment, sameDayAssignments);
      if (conflict) {
        ctx.addIssue({ code: 'custom', message: describeConflict(conflict), path: ['vehicleId'] });
      }
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
