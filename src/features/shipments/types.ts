export const SHIPMENT_STATUSES = [
  'pending',
  'assigned',
  'in_transit',
  'delivered',
  'cancelled',
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const PRIORITIES = ['high', 'medium', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export type ShipmentPackage = {
  /** Código de bulto, ej. "11259495-1". */
  code: string;
  weightKg: number;
  volumeM3: number;
};

export type Shipment = {
  /** Número de entrega, ej. "123445". */
  id: string;
  trackingNumber: string;
  customer: string;
  destination: { lat: number; lng: number; address: string };
  status: ShipmentStatus;
  priority: Priority;
  driverId?: string;
  vehicleId?: string;
  /** ISO 8601. */
  estimatedDelivery: string;
  /** Valor declarado, en pesos. */
  declaredValue: number;
  packages: ShipmentPackage[];
  cancellationReason?: string;
};

export type ShipmentMetrics = {
  weightKg: number;
  volumeM3: number;
  packageCount: number;
  value: number;
};

export type ShipmentFilters = {
  /** Texto libre sobre número, seguimiento, cliente y dirección. */
  query: string;
  statuses: ShipmentStatus[];
  priorities: Priority[];
  driverIds: string[];
  addressQuery: string;
  /** Día de entrega estimada, "YYYY-MM-DD". */
  date?: string;
};

/** Un filtro aplicado que se puede quitar desde su chip. */
export type ActiveFilter =
  | { kind: 'status'; value: ShipmentStatus }
  | { kind: 'priority'; value: Priority }
  | { kind: 'driver'; value: string }
  | { kind: 'address' }
  | { kind: 'date' };

export type ActiveFilterChip = { key: string; label: string; filter: ActiveFilter };
