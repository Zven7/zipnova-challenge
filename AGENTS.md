# AGENTS.md

Reglas y decisiones para el agente que desarrolla este proyecto. Complementan el enunciado de la prueba técnica (`CHALLENGE.md`). Si algo de este archivo contradice al enunciado o al UI Kit de Figma que enlaza, **prevalece `CHALLENGE.md`**: seguí el enunciado y anotá la diferencia en el README.

## 0. Forma de trabajo

1. **Antes de escribir código**, proponé un plan breve con: estructura de carpetas, modelo de datos final y cualquier decisión que difiera de este archivo. Esperá mi aprobación.
2. Trabajá por etapas y dejá el proyecto compilando al final de cada una:
   1. Setup (Vite, TS estricto, Tailwind, Redux Toolkit, RHF, Leaflet).
   2. Mock data + store.
   3. Componentes UI base (design system).
   4. Listado + card de envío.
   5. Mapa y sincronización con la lista.
   6. Filtros y búsqueda.
   7. Acciones con React Hook Form.
   8. Pulido, estados vacíos, accesibilidad, README.
3. Si falta información (por ejemplo, un detalle del diseño), **no la inventes en silencio**: elegí la opción más simple, anotala en la sección "Decisiones" del README y seguí.

## 1. Alcance

**Dentro:** listado de envíos, mapa, filtros y búsqueda, detalle, acciones sobre envíos.

**Fuera:** backend, autenticación, routing real o cálculo de rutas óptimas, i18n, tests end-to-end. La app es de una sola pantalla; no hace falta react-router.

El objetivo es resolver el flujo principal de forma **clara y mantenible**, no construir una app logística completa. No agregues funcionalidades que no se piden.

## 2. Stack

| Tema        | Decisión                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Build       | Vite + React 18+ + TypeScript                                                                      |
| TypeScript  | `strict: true`, sin `any`, sin `@ts-ignore`                                                        |
| Estilos     | Tailwind CSS. Tokens del design system en `tailwind.config` (colores, radios, tipografía, sombras) |
| Estado      | Redux Toolkit (`createSlice`, `createEntityAdapter`, selectores memoizados)                        |
| Formularios | React Hook Form. Validación con Zod + `@hookform/resolvers`                                        |
| Mapa        | Leaflet + `react-leaflet`, con tiles que no requieran API key                                      |
| Íconos      | Los SVG del kit de Figma; `lucide-react` solo para lo que el kit no define                         |
| Calidad     | ESLint + Prettier configurados, scripts `lint`, `typecheck`, `test`, `build`                       |

No agregues otras dependencias sin justificarlo en el plan.

## 3. Estructura de carpetas

```
src/
  app/
    store.ts            # configureStore, tipos RootState / AppDispatch
    hooks.ts            # useAppDispatch, useAppSelector tipados
  components/
    ui/                 # design system: MultiSelect, FilterMenu, DatePicker, Button...
  features/
    shipments/
      components/       # ShipmentCard, ShipmentList, ShipmentMap...
        actions/        # modal y formularios de acciones
      store/            # slices, selectores, thunks
      hooks/
      rules.ts          # reglas de negocio puras
      schemas.ts        # esquemas Zod de los formularios
      types.ts
      mock.ts
    drivers/
    vehicles/
    notifications/      # toasts
  lib/                  # utilidades puras (formateo de fechas, geografía)
  dev/                  # página de ejemplos del kit (#dev)
  test/                 # setup de Vitest y helpers de render
  App.tsx
  main.tsx
```

Reglas:

- `components/ui` **no conoce** el dominio de envíos: recibe props genéricas.
- `features/*` puede usar `components/ui`, nunca al revés.
- Un componente por archivo, nombre en PascalCase, export nombrado.

## 4. Modelo de datos

Partir del tipo del enunciado y extenderlo para cubrir lo que muestra la card del kit:

```ts
type ShipmentStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
type Priority = 'low' | 'medium' | 'high';

type Shipment = {
  id: string; // número de entrega, como en el kit: "123445"
  trackingNumber: string; // la card lo muestra debajo del número
  customer: string;
  destination: { lat: number; lng: number; address: string };
  status: ShipmentStatus;
  priority: Priority;
  driverId?: string;
  vehicleId?: string;
  estimatedDelivery: string; // ISO 8601
  declaredValue: number;
  packages: { code: string; weightKg: number; volumeM3: number }[]; // como el detalle del kit
  cancellationReason?: string;
};

type Driver = { id: string; name: string; phone: string };
type Vehicle = { id: string; plate: string; model: string; capacityKg: number };
```

Las métricas de la card (peso, volumen, bultos y valor) **se calculan** a partir de los paquetes y del valor declarado; no se guardan aparte, para que no puedan quedar inconsistentes.

Mock: **20 envíos, 5 conductores, 5 vehículos**. Condiciones:

- Coordenadas reales y cercanas entre sí (una sola ciudad o región, por ejemplo Buenos Aires y alrededores) para que el mapa se vea bien.
- Mezcla realista de estados y prioridades; al menos 3 envíos sin conductor ni vehículo (`pending`); al menos 1 `cancelled` y 1 `delivered`.
- Coherencia: un envío `pending` no tiene conductor; uno `assigned` o `in_transit` sí. En un mismo día, cada conductor usa un solo vehículo.
- Fechas relativas al día actual para que los filtros por fecha tengan resultados.

## 5. Estado (Redux)

- `shipments` normalizado con `createEntityAdapter` (`ids` / `entities`). Drivers y vehículos igual.
- Slice de UI/filtros separado de los datos:
  ```ts
  filters: {
    query: string;              // búsqueda de texto (número, seguimiento, cliente, dirección)
    statuses: ShipmentStatus[];
    priorities: Priority[];
    driverIds: string[];
    addressQuery: string;       // submenú "dirección" del Filtro
    date?: string;              // submenú "fecha": un día ("YYYY-MM-DD") sobre estimatedDelivery
  }
  selectedShipmentId?: string;
  expandedShipmentIds: string[];
  ```
- **Una sola fuente de verdad para lo visible**: un selector memoizado `selectFilteredShipments`. La lista y el mapa consumen **el mismo selector**. Filtrar la lista filtra también los marcadores.
- Los componentes no filtran ni transforman datos por su cuenta: usan selectores.
- Las acciones (asignar, cambiar estado, cancelar) son reducers o thunks simulados con un pequeño delay (`setTimeout`) para mostrar estados de carga y error; no hay red real.

## 6. Comportamiento esperado

**Listado**

- Cards de envío en dos versiones, según el kit: **colapsada** (número de envío + acción "ubicar en el mapa") y **expandida** (peso, volumen, bultos, valor, detalle de paquetes y asignación de conductor y vehículo).
- Contador de resultados ("12 de 20 envíos").
- Estado vacío cuando los filtros no devuelven nada, con botón "Limpiar filtros".

**Mapa**

- Un marcador por envío visible. El color del marcador refleja el estado, con leyenda.
- "Ubicar en el mapa": centra el mapa en el envío con `flyTo`, abre su popup y marca la card como seleccionada. Hacer clic en un marcador hace lo inverso: selecciona y expande la card (con scroll hasta ella).
- Ajustar los límites del mapa (`fitBounds`) cuando cambian los filtros.

**Filtros y búsqueda**

- Barra de búsqueda de texto libre.
- Componente **Filtro**: botón que abre un menú con submenús; cada submenú contiene un buscador de dirección o un date picker de un día (ver kit).
- Componente **Selección múltiple con búsqueda** para estado, prioridad y conductor, con todos sus estados: default, activo, búsqueda con resultados, búsqueda sin resultados y opciones seleccionadas, incluida la opción "Select all" ("Seleccionar todo").
- Los filtros activos se muestran como chips removibles.

**Acciones sobre envíos** (formulario con React Hook Form + Zod)

- Asignar o reasignar conductor y vehículo (ambos requeridos al asignar; no permitir asignar un vehículo ya usado en otro envío `in_transit`).
- Cambiar el estado respetando transiciones válidas: `pending → assigned → in_transit → delivered`; `cancelled` desde cualquier estado excepto `delivered`.
- Cancelar con confirmación (y motivo opcional).
- Mensajes de error por campo y feedback de éxito (toast simple).

## 7. Diseño

- Se parte del UI Kit de Figma enlazado en `CHALLENGE.md`. No improvises el estilo; si falta algo, pedímelo.
- Extraé los tokens (colores, tipografía, radios, espaciados, sombras) al `tailwind.config` antes de construir componentes.
- Cada componente del kit se implementa como componente reutilizable con **todos sus estados** documentados en un ejemplo simple (puede ser una página `/dev` o un archivo `examples`).
- Layout sugerido: panel izquierdo con búsqueda, filtros y lista; mapa a la derecha. En pantallas chicas, mapa y lista como pestañas.

## 8. Calidad y accesibilidad

- TypeScript sin errores, ESLint sin warnings, Prettier aplicado, `npm run build` exitoso.
- Navegación por teclado en el multiselect y el menú de filtros (flechas, Enter, Escape).
- Labels y `aria-*` correctos; foco visible; contraste suficiente.
- Tests con Vitest: funciones puras de `lib/`, reglas y selectores, más tests de componentes con Testing Library para los flujos de teclado y los formularios. No hace falta testear cada componente.
- Sin `console.log` ni código comentado en la entrega.
- Commits chicos y con mensajes claros (conventional commits).
- La CI (GitHub Actions) corre formato, lint, typecheck, tests y build en cada push y PR; el deploy solo sale si todo pasa.

## 9. Entregables

- Código funcionando con `npm install && npm run dev`.
- `README.md` con: cómo correrlo, estructura del proyecto, decisiones técnicas (librería de mapa, normalización, validaciones), supuestos tomados donde el enunciado era ambiguo y qué mejoraría con más tiempo.

## 10. Definición de terminado

- [x] Los 20 envíos, 5 conductores y 5 vehículos se ven en lista y mapa.
- [x] Filtros, búsqueda y mapa están sincronizados.
- [x] Los tres componentes del kit existen con todos sus estados.
- [x] Las acciones funcionan con validación y feedback.
- [x] Estados vacío, carga y error cubiertos.
- [x] Responsive y navegable con teclado.
- [x] `lint`, `typecheck`, `test` y `build` pasan.
- [x] README completo.
