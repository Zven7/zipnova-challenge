# Envíos en operación

Herramienta para que un operador logístico tenga una visión general de los envíos en curso: listado, mapa, filtros y búsqueda, detalle y acciones sobre cada envío. Es una sola pantalla, sin backend: los datos son un mock en memoria y las acciones simulan la latencia de red.

## Cómo correrlo

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev
```

| Script              | Qué hace                            |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Servidor de desarrollo              |
| `npm run build`     | Typecheck + build de producción     |
| `npm run typecheck` | TypeScript sin emitir               |
| `npm run lint`      | ESLint, falla con cualquier warning |
| `npm test`          | Tests unitarios y de componentes    |
| `npm run format`    | Prettier                            |

Rutas útiles:

- **`/#dev`**: los componentes del UI Kit en todos sus estados.
- **`/?simular-error=carga`** y **`/?simular-error=acciones`**: fuerzan el error de la carga inicial o de las acciones, para ver esos estados.

## Funcionalidades

- **Listado** con la card del kit, colapsada y expandida, contador de resultados y estados de carga, error y vacío.
- **Mapa** con un marcador por envío visible, coloreado por estado. Se puede elegir entre un estilo **Simple**, oscuro y con poco detalle para que resalten los marcadores, y uno **Detallado** (OpenStreetMap).
- **Lista y mapa sincronizados**: "Ubicar en el mapa" centra el envío y abre su popup; un clic en un marcador selecciona y expande la card. Al filtrar, el mapa se reencuadra.
- **Filtros y búsqueda**: texto libre, selección múltiple con búsqueda para estado, prioridad y conductor, y el menú **Filtro** con dirección y fecha. Los filtros activos se muestran como chips.
- **Acciones**: asignar o reasignar conductor y vehículo, avanzar el estado y cancelar con confirmación, con validación por campo y aviso de éxito.
- **Responsive**: en pantallas chicas, lista y mapa pasan a ser pestañas.

## Stack

React 19, TypeScript estricto, Vite, Tailwind CSS, Redux Toolkit, React Hook Form + Zod, Leaflet (`react-leaflet`), Vitest y Testing Library.

## Estructura

```
src/
  app/                 store y hooks tipados
  components/ui/       design system, sin conocimiento del dominio
  features/
    shipments/
      components/      card, lista, mapa, filtros, panel
        actions/       modal y formularios de acciones
      store/           slices, selectores, thunks
      rules.ts         reglas de negocio puras
      schemas.ts       esquemas Zod de los formularios
      mock.ts          20 envíos con fechas relativas a hoy
    drivers/           5 conductores
    vehicles/          5 vehículos
    notifications/     toasts
  lib/                 utilidades puras: fechas, formato, texto, geografía
  dev/                 página de ejemplos (#dev)
  test/                setup de tests
```

`components/ui` no importa nada de `features/`.

## Decisiones técnicas

**Diseño.** Los tokens (colores, tipografía, radios y sombras) y los íconos salen del UI Kit de Figma y viven en `tailwind.config.ts` y `components/ui/iconData.tsx`. Los componentes del kit están hechos a mano para respetar su diseño y sus estados; `lucide-react` se usa solo para lo que el kit no define.

**Estado.** Envíos, conductores y vehículos están normalizados con `createEntityAdapter`. Los filtros y la selección viven en un slice aparte. La lista, el contador y el mapa consumen el mismo selector memoizado (`selectFilteredShipments`), así que no pueden mostrar cosas distintas.

**Validaciones.** Las reglas de negocio son funciones puras (`rules.ts`) que usan tanto los esquemas Zod del formulario como los thunks. Los thunks vuelven a validar contra el estado actual, como lo haría un backend.

- Asignar exige conductor y vehículo. Un vehículo en tránsito no recibe envíos nuevos, y en un mismo día cada conductor usa un solo vehículo.
- Flujo de estados: `pending → assigned → in_transit → delivered`. Se puede cancelar desde cualquier estado excepto `delivered`.

**Mapa.** Leaflet con tiles que no requieren API key: Esri World Dark Gray para el estilo Simple y OpenStreetMap para el Detallado. El mapa y los formularios se cargan en diferido; si la descarga falla, un error boundary ofrece reintentar y la lista sigue funcionando.

**Accesibilidad.** La selección múltiple, el menú de filtros y el date picker siguen los patrones ARIA correspondientes (combobox, menú y grilla) y se manejan por completo con teclado. El modal usa `<dialog>` nativo.

**Tests.** Vitest cubre utilidades, reglas, esquemas, selectores, thunks y la coherencia del mock. Con Testing Library se prueban el teclado de la selección múltiple y del menú de filtros, el formulario de asignación y el panel con un store real.

## Supuestos

- **Filtro de fecha de un día**, como el date picker del kit, sobre la entrega estimada.
- **Modelo extendido** con número de seguimiento, valor declarado, paquetes y motivo de cancelación. El peso, el volumen y los bultos se calculan a partir de los paquetes.
- **Detalle en la card expandida**: además de lo que muestra el kit, cliente, destino, entrega estimada, estado y prioridad, con los mismos tokens.
- **Colores de estado** para marcadores y badges, que el kit no define.
- **Interfaz en español**, incluidos los textos que el kit tiene en inglés.
- **Reasignación** solo antes de que el envío salga (`pending` o `assigned`).
- **Lista ordenada** por entrega estimada.

## CI/CD

GitHub Actions corre formato, lint, typecheck, tests y build en cada push y pull request. En `main`, si todo pasa, publica el build en GitHub Pages. Para activarlo: **Settings → Pages → Source: GitHub Actions**.

## Próximos pasos

- Tests e2e con Playwright para el mapa y el layout mobile.
- Agrupar marcadores y virtualizar la lista para volúmenes reales.
- Filtros en la URL para compartir una vista.
