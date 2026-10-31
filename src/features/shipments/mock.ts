import { atDayOffset } from '@/lib/date';
import type { Shipment, ShipmentPackage } from './types';

type ShipmentSeed = Omit<Shipment, 'estimatedDelivery' | 'packages'> & {
  /** Días respecto de hoy y hora local de la entrega estimada. */
  delivery: [dayOffset: number, hour: number];
  /** Código base de los bultos y [peso kg, volumen m³] de cada uno. */
  packages: [codeBase: number, items: [weightKg: number, volumeM3: number][]];
};

const seeds: ShipmentSeed[] = [
  // Pendientes: sin conductor ni vehículo.
  {
    id: '123445',
    trackingNumber: '0999-2234908283',
    customer: 'Ferretería El Tornillo',
    destination: {
      lat: -34.6037,
      lng: -58.3816,
      address: 'Av. Corrientes 1234, San Nicolás, CABA',
    },
    status: 'pending',
    priority: 'high',
    delivery: [0, 16],
    declaredValue: 230000,
    packages: [
      11259495,
      [
        [30, 0.1],
        [30, 0.1],
      ],
    ],
  },
  {
    id: '123452',
    trackingNumber: '0999-2234908517',
    customer: 'Librería Rayuela',
    destination: { lat: -34.6221, lng: -58.3717, address: 'Defensa 1200, San Telmo, CABA' },
    status: 'pending',
    priority: 'medium',
    delivery: [0, 18],
    declaredValue: 86500,
    packages: [11259540, [[12, 0.05]]],
  },
  {
    id: '123467',
    trackingNumber: '0999-2234909102',
    customer: 'Vivero Las Glicinas',
    destination: {
      lat: -34.4921,
      lng: -58.5038,
      address: 'Av. del Libertador 14000, Martínez, Buenos Aires',
    },
    status: 'pending',
    priority: 'low',
    delivery: [1, 10],
    declaredValue: 412000,
    packages: [
      11259611,
      [
        [85, 0.6],
        [40, 0.32],
        [40, 0.32],
      ],
    ],
  },
  {
    id: '123471',
    trackingNumber: '0999-2234909266',
    customer: 'Óptica Visión Clara',
    destination: { lat: -34.5891, lng: -58.3962, address: 'Av. Pueyrredón 1700, Recoleta, CABA' },
    status: 'pending',
    priority: 'high',
    delivery: [1, 12],
    declaredValue: 975000,
    packages: [
      11259648,
      [
        [4, 0.02],
        [3.5, 0.02],
      ],
    ],
  },
  {
    id: '123488',
    trackingNumber: '0999-2234909731',
    customer: 'Panadería La Espiga',
    destination: {
      lat: -34.6618,
      lng: -58.3651,
      address: 'Av. Mitre 600, Avellaneda, Buenos Aires',
    },
    status: 'pending',
    priority: 'medium',
    delivery: [2, 9],
    declaredValue: 154000,
    packages: [
      11259702,
      [
        [25, 0.18],
        [25, 0.18],
      ],
    ],
  },

  // Asignados: con conductor y vehículo, todavía sin salir.
  {
    id: '123491',
    trackingNumber: '0999-2234909858',
    customer: 'Estudio Contable Ríos',
    destination: { lat: -34.5605, lng: -58.4561, address: 'Av. Cabildo 2040, Belgrano, CABA' },
    status: 'assigned',
    priority: 'medium',
    driverId: 'drv-4',
    vehicleId: 'veh-4',
    delivery: [0, 17],
    declaredValue: 64000,
    packages: [11259733, [[6, 0.04]]],
  },
  {
    id: '123503',
    trackingNumber: '0999-2234910244',
    customer: 'Bicicletería Rodado 29',
    destination: {
      lat: -34.5741,
      lng: -58.4868,
      address: 'Av. Triunvirato 4500, Villa Urquiza, CABA',
    },
    status: 'assigned',
    priority: 'high',
    driverId: 'drv-5',
    vehicleId: 'veh-5',
    delivery: [0, 19],
    declaredValue: 1380000,
    packages: [
      11259790,
      [
        [18, 0.25],
        [18, 0.25],
        [16, 0.22],
      ],
    ],
  },
  {
    id: '123516',
    trackingNumber: '0999-2234910675',
    customer: 'Almacén Don Pepe',
    destination: {
      lat: -34.6243,
      lng: -58.4036,
      address: 'Av. San Juan 2800, San Cristóbal, CABA',
    },
    status: 'assigned',
    priority: 'low',
    driverId: 'drv-4',
    vehicleId: 'veh-4',
    delivery: [1, 11],
    declaredValue: 98000,
    packages: [
      11259834,
      [
        [22, 0.15],
        [20, 0.15],
      ],
    ],
  },
  {
    id: '123524',
    trackingNumber: '0999-2234910923',
    customer: 'Farmacia del Parque',
    destination: {
      lat: -34.6382,
      lng: -58.4788,
      address: 'Av. Directorio 3900, Parque Avellaneda, CABA',
    },
    status: 'assigned',
    priority: 'high',
    driverId: 'drv-5',
    vehicleId: 'veh-5',
    delivery: [1, 14],
    declaredValue: 520000,
    packages: [
      11259870,
      [
        [8, 0.06],
        [8, 0.06],
      ],
    ],
  },
  {
    id: '123537',
    trackingNumber: '0999-2234911380',
    customer: 'Colegio San Andrés de Olivos',
    destination: { lat: -34.5102, lng: -58.4929, address: 'Av. Maipú 2500, Olivos, Buenos Aires' },
    status: 'assigned',
    priority: 'medium',
    driverId: 'drv-4',
    vehicleId: 'veh-4',
    delivery: [2, 10],
    declaredValue: 310000,
    packages: [
      11259915,
      [
        [45, 0.4],
        [45, 0.4],
      ],
    ],
  },

  // En tránsito: un vehículo distinto por envío.
  {
    id: '123542',
    trackingNumber: '0999-2234911562',
    customer: 'Café Martinica',
    destination: { lat: -34.588, lng: -58.4103, address: 'Av. Santa Fe 3253, Palermo, CABA' },
    status: 'in_transit',
    priority: 'high',
    driverId: 'drv-1',
    vehicleId: 'veh-1',
    delivery: [0, 13],
    declaredValue: 187000,
    packages: [
      11259951,
      [
        [15, 0.12],
        [15, 0.12],
      ],
    ],
  },
  {
    id: '123558',
    trackingNumber: '0999-2234912047',
    customer: 'Textil Hilos del Sur',
    destination: { lat: -34.6268, lng: -58.4559, address: 'Av. Rivadavia 6200, Caballito, CABA' },
    status: 'in_transit',
    priority: 'medium',
    driverId: 'drv-2',
    vehicleId: 'veh-2',
    delivery: [0, 15],
    declaredValue: 645000,
    packages: [
      11260012,
      [
        [28, 0.3],
        [28, 0.3],
        [24, 0.26],
      ],
    ],
  },
  {
    id: '123563',
    trackingNumber: '0999-2234912218',
    customer: 'Distribuidora Norte Grande',
    destination: {
      lat: -34.6071,
      lng: -58.5629,
      address: 'Av. San Martín 3000, Caseros, Buenos Aires',
    },
    status: 'in_transit',
    priority: 'low',
    driverId: 'drv-3',
    vehicleId: 'veh-3',
    delivery: [0, 17],
    declaredValue: 238000,
    packages: [11260056, [[60, 0.45]]],
  },

  // Entregados.
  {
    id: '123570',
    trackingNumber: '0999-2234912493',
    customer: 'Restaurante Lo de Tita',
    destination: {
      lat: -34.6082,
      lng: -58.3636,
      address: 'Olga Cossettini 1500, Puerto Madero, CABA',
    },
    status: 'delivered',
    priority: 'medium',
    driverId: 'drv-1',
    vehicleId: 'veh-1',
    delivery: [-1, 11],
    declaredValue: 142000,
    packages: [
      11260093,
      [
        [20, 0.16],
        [20, 0.16],
      ],
    ],
  },
  {
    id: '123584',
    trackingNumber: '0999-2234912956',
    customer: 'Juguetería Calesita',
    destination: {
      lat: -34.6401,
      lng: -58.3772,
      address: 'Av. Montes de Oca 1100, Barracas, CABA',
    },
    status: 'delivered',
    priority: 'low',
    driverId: 'drv-2',
    vehicleId: 'veh-2',
    delivery: [-1, 15],
    declaredValue: 276000,
    packages: [
      11260130,
      [
        [10, 0.2],
        [10, 0.2],
      ],
    ],
  },
  {
    id: '123599',
    trackingNumber: '0999-2234913401',
    customer: 'Clínica Veterinaria Huellas',
    destination: {
      lat: -34.5801,
      lng: -58.4602,
      address: 'Av. Álvarez Thomas 1500, Colegiales, CABA',
    },
    status: 'delivered',
    priority: 'high',
    driverId: 'drv-3',
    vehicleId: 'veh-3',
    delivery: [-2, 10],
    declaredValue: 430000,
    packages: [11260177, [[14, 0.08]]],
  },
  {
    id: '123605',
    trackingNumber: '0999-2234913684',
    customer: 'Gimnasio Fuerza Oeste',
    destination: {
      lat: -34.6441,
      lng: -58.5934,
      address: 'Av. Rivadavia 17000, Haedo, Buenos Aires',
    },
    status: 'delivered',
    priority: 'medium',
    driverId: 'drv-1',
    vehicleId: 'veh-1',
    delivery: [0, 9],
    declaredValue: 890000,
    packages: [
      11260215,
      [
        [70, 0.5],
        [55, 0.42],
      ],
    ],
  },

  // Cancelados.
  {
    id: '123612',
    trackingNumber: '0999-2234913957',
    customer: 'Mueblería Roble Viejo',
    destination: {
      lat: -34.637,
      lng: -58.5389,
      address: 'Av. Gaona 3500, Ciudadela, Buenos Aires',
    },
    status: 'cancelled',
    priority: 'low',
    driverId: 'drv-2',
    vehicleId: 'veh-2',
    delivery: [-1, 16],
    declaredValue: 1150000,
    packages: [11260251, [[95, 0.9]]],
    cancellationReason: 'El cliente reprogramó la compra.',
  },
  {
    id: '123627',
    trackingNumber: '0999-2234914312',
    customer: 'Kiosco La Esquina',
    destination: {
      lat: -34.7601,
      lng: -58.4041,
      address: 'Av. Hipólito Yrigoyen 8500, Lomas de Zamora, Buenos Aires',
    },
    status: 'cancelled',
    priority: 'medium',
    delivery: [0, 12],
    declaredValue: 47000,
    packages: [11260298, [[5, 0.03]]],
  },
  {
    id: '123634',
    trackingNumber: '0999-2234914590',
    customer: 'Pinturería Arcoíris',
    destination: {
      lat: -34.5951,
      lng: -58.4437,
      address: 'Av. Juan B. Justo 4500, Villa Crespo, CABA',
    },
    status: 'cancelled',
    priority: 'high',
    delivery: [1, 15],
    declaredValue: 365000,
    packages: [
      11260334,
      [
        [32, 0.2],
        [32, 0.2],
      ],
    ],
    cancellationReason: 'Dirección de entrega incorrecta.',
  },
];

function buildPackages([codeBase, items]: ShipmentSeed['packages']): ShipmentPackage[] {
  return items.map(([weightKg, volumeM3], index) => ({
    code: `${codeBase + index}-1`,
    weightKg,
    volumeM3,
  }));
}

/** Genera los envíos con fechas relativas a `today` para que los filtros por fecha tengan resultados. */
export function createMockShipments(today: Date = new Date()): Shipment[] {
  return seeds.map(({ delivery: [dayOffset, hour], packages, ...shipment }) => ({
    ...shipment,
    estimatedDelivery: atDayOffset(today, dayOffset, hour).toISOString(),
    packages: buildPackages(packages),
  }));
}
