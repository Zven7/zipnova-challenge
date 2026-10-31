import { describe, expect, it } from 'vitest';
import {
  cancelSchema,
  createAssignmentSchema,
  createStatusSchema,
  REASON_MAX_LENGTH,
} from './schemas';
import { VEHICLE_BUSY_MESSAGE } from './rules';

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe('createAssignmentSchema', () => {
  const schema = createAssignmentSchema(['veh-1']);

  it('exige conductor y vehículo', () => {
    const result = schema.safeParse({ driverId: '', vehicleId: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(['driverId', 'vehicleId']);
  });

  it('rechaza un vehículo en tránsito con otro envío', () => {
    const result = schema.safeParse({ driverId: 'drv-1', vehicleId: 'veh-1' });
    expect(firstError(result)).toBe(VEHICLE_BUSY_MESSAGE);
  });

  it('acepta una asignación válida', () => {
    expect(schema.safeParse({ driverId: 'drv-1', vehicleId: 'veh-2' }).success).toBe(true);
  });
});

describe('createStatusSchema', () => {
  it('acepta solo el siguiente paso del flujo', () => {
    const schema = createStatusSchema('assigned');
    expect(schema.safeParse({ status: 'in_transit' }).success).toBe(true);
    expect(schema.safeParse({ status: 'delivered' }).success).toBe(false);
  });

  it('no usa este formulario para cancelar', () => {
    expect(createStatusSchema('assigned').safeParse({ status: 'cancelled' }).success).toBe(false);
  });
});

describe('cancelSchema', () => {
  it('exige confirmar y deja el motivo opcional', () => {
    expect(cancelSchema.safeParse({ reason: '', confirmed: false }).success).toBe(false);
    expect(cancelSchema.safeParse({ reason: '', confirmed: true }).success).toBe(true);
  });

  it('limita el largo del motivo', () => {
    const reason = 'a'.repeat(REASON_MAX_LENGTH + 1);
    expect(cancelSchema.safeParse({ reason, confirmed: true }).success).toBe(false);
  });
});
