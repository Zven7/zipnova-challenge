# Envíos en operación

Herramienta para que un operador logístico tenga una visión general de los envíos en curso: listado, mapa, filtros y búsqueda, detalle y acciones sobre cada envío. Es una sola pantalla, sin backend: los datos son un mock en memoria y las acciones simulan la latencia de red.

## Cómo correrlo

Requiere Node 22.12 o superior (lo exigen Vite 8 y Vitest 5).

```bash
npm install
npm run dev
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Typecheck + build de producción |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint, falla con cualquier warning |
| `npm test` | Tests unitarios (Vitest) |
| `npm run format` | Prettier |

Rutas útiles:

- **`/#dev`**: página de ejemplos con los componentes del UI Kit en todos sus estados.
- **`/?simular-error=carga`**: la carga inicial falla, para ver el estado de error con "Reintentar".
- **`/?simular-error=acciones`**: las acciones (asignar, cambiar estado, cancelar) fallan, para ver el error en el formulario.

## Qué hace

- **Listado** de los 20 envíos con la card del kit: colapsada (número, seguimiento, ubicar en el mapa) y expandida (peso, volumen, bultos, valor, paquetes y asignación). Contador "12 de 20 envíos", skeleton de carga, estado de error y estado vacío con "Limpiar filtros".
- **Mapa** (Leaflet + OpenStreetMap) con un marcador por envío visible, coloreado por estado y con leyenda. Oscuro por defecto, con un selector para el mapa claro estándar de OSM.
- **Sincronización lista ↔ mapa**: "ubicar" centra con `flyTo` y abre el popup; un clic en un marcador selecciona la card, la expande y hace scroll hasta ella. Al filtrar, el mapa se ajusta con `fitBounds`.
- **Filtros y búsqueda**: texto libre (número, seguimiento, cliente, dirección), selección múltiple con búsqueda para estado, prioridad y conductor, y el menú **Filtro** con los submenús de dirección y fecha. Los filtros activos se muestran como chips removibles.
- **Acciones** en un modal con React Hook Form + Zod: asignar o reasignar conductor y vehículo, cambiar el estado según el flujo válido y cancelar con confirmación y motivo opcional. Errores por campo, estado de carga y toast de éxito.
- **Responsive**: en pantallas chicas, lista y mapa pasan a ser pestañas.

## Estructura

```
src/
  app/                 store (configureStore, RootState) y hooks tipados
  components/ui/       design system, sin conocimiento del dominio
                       MultiSelect, FilterMenu, DatePicker, SuggestionSearch,
                       Icon (SVG del kit), Dialog, Select, Chip, Button...
  features/
    shipments/
      components/      ShipmentCard, ShipmentList, ShipmentMap, filtros, panel
        actions/       modal y formularios de acciones
      store/           slices, selectores, thunks
      hooks/           useMapStyle
      rules.ts         reglas de negocio puras (transiciones, vehículos ocupados)
      schemas.ts       esquemas Zod de los formularios
      mock.ts          20 envíos con fechas relativas a hoy
    drivers/           tipos, mock y slice normalizado
    vehicles/          tipos, mock y slice normalizado
    notifications/     toasts
  lib/                 utilidades puras: fechas, formato, texto, geografía
  dev/                 página de ejemplos (#dev)
```

`components/ui` no importa nada de `features/`: recibe props genéricas. Hay un componente por archivo.

## Decisiones técnicas

**Diseño y tokens.** Los colores, la tipografía (Plus Jakarta Sans), los radios y las sombras salen del archivo de Figma, leído con la API REST de Figma, y están en `tailwind.config.ts`. Los íconos son los SVG originales del kit exportados desde Figma (`components/ui/iconData.tsx`), con los colores reemplazados por `currentColor`. Los componentes del kit se compararon en 2x contra los renders de Figma. `lucide-react` se usa solo para piezas que el kit no define: toast y cierre del modal.

**Tailwind 4 con config en JS.** AGENTS.md pide los tokens en `tailwind.config`, así que se cargan con `@config`. En ese modo Tailwind no genera variables CSS para los tokens, por eso el CSS propio usa `theme('colors.surface.DEFAULT')`.

**Mapa.** Leaflet + `react-leaflet` con tiles de OpenStreetMap, sin API key. CARTO Dark Matter se descartó porque hoy exige key (devuelve una imagen "API KEY REQUIRED"). El modo oscuro aplica un filtro CSS solo a la capa de tiles, no a los marcadores ni a los popups. Los marcadores son `divIcon`: los colores salen de los tokens, son enfocables con teclado y se evita el problema de los PNG por defecto con Vite. El mapa se carga en diferido (`lazy`), en un chunk propio.

**Estado y normalización.** Envíos, conductores y vehículos usan `createEntityAdapter`. Los filtros, la selección y las cards expandidas viven en un slice de vista separado de los datos. **`selectFilteredShipments` es la única fuente de lo visible**: la lista, el contador y los marcadores consumen ese selector, y ningún componente filtra por su cuenta. La selección guarda su origen (`list` o `map`) y un contador de versión. Así "ubicar" centra el mapa aunque el envío ya esté seleccionado, y el clic en un marcador no provoca un zoom que salte.

**Validaciones.** Las reglas de negocio son funciones puras en `rules.ts`. Las usan tanto los esquemas Zod de los formularios, que validan en el cliente con errores por campo, como los thunks, que vuelven a validar contra el estado actual igual que lo haría un backend. Así, si algo cambió entre que se abrió el formulario y se guardó, la acción se rechaza con un mensaje claro.

- Asignar exige conductor y vehículo, y no acepta un vehículo que esté `in_transit` en otro envío.
- Flujo de estados: `pending → assigned → in_transit → delivered`. `cancelled` se puede alcanzar desde cualquier estado excepto `delivered`.
- Pasar a `in_transit` también verifica que el vehículo no esté en tránsito con otro envío.

**Accesibilidad.** La selección múltiple sigue el patrón combobox + listbox multiselección (flechas, Home/End, Enter, Escape). El filtro es un menú (flechas, ArrowRight para entrar al submenú, Escape para volver) y el date picker es una grilla con foco itinerante (flechas, PageUp/PageDown). El modal usa `<dialog>` nativo, que atrapa el foco, cierra con Escape y lo devuelve al cerrar. Todos los controles tienen label y foco visible.

**Tests.** Vitest cubre las funciones puras de `lib/`, las reglas, los esquemas, los selectores (incluida la memoización), el slice de vista, los thunks (con temporizadores falsos) y la coherencia del mock.

## Supuestos y decisiones donde el enunciado era ambiguo

Cuando AGENTS.md y CHALLENGE.md difieren, prevalece CHALLENGE.md y el diseño de Figma que enlaza.

- **Filtro de fecha de un solo día**: el date picker del kit selecciona una fecha, no un rango. Filtra por la entrega estimada.
- **Submenú de dirección**: "Escribe y selecciona una dirección" se implementó como buscador con sugerencias tomadas de las direcciones de los envíos. Enter sin elegir una sugerencia filtra por el texto escrito.
- **Modelo de datos**: se agregaron `trackingNumber` (la card lo muestra), `declaredValue`, `packages` con código, peso y volumen, y `cancellationReason`. El peso, el volumen y los bultos de la card **se calculan sumando los paquetes** (en el kit, 2 × 30 kg = 60 kg), en lugar de guardarse aparte, para que no puedan quedar inconsistentes. Los ids son numéricos ("Entrega 123445"), como en el kit.
- **Detalle en la card expandida**: el kit no muestra cliente, destino, entrega estimada, estado ni prioridad, y el operador los necesita. Se agregó un bloque con esos datos usando los mismos tokens. La card colapsada respeta el kit tal cual.
- **Color del marcador por estado** (pendiente, asignado, en tránsito, entregado, cancelado), con leyenda. Esa paleta no está en el kit y se eligió para leerse bien sobre fondo oscuro.
- **Textos en español**, incluidos los que el kit tiene en inglés ("Seleccionar todo", "Sin opciones", "Buscar"), con el mismo registro de tú que el propio kit ("Escribe y selecciona"). Volúmenes con coma decimal ("0,100 m3"), como "0,200 m3" en la misma card.
- **Selección múltiple cerrada**: muestra las opciones elegidas (o "Todos") en lugar del placeholder. La lista se abre como popover encima del contenido. En el kit, un estado tiene un padding distinto a los otros tres: se siguió la mayoría.
- **Reasignación** permitida para envíos `pending` y `assigned`. En tránsito ya no se cambia el vehículo.
- **Cambio a `assigned`**: se hace desde el formulario de asignación, porque requiere conductor y vehículo. El formulario de estado avanza solo el siguiente paso y muestra el flujo completo.
- **Errores de las acciones**: se muestran dentro del formulario. El toast se usa para el éxito.
- **Orden de la lista**: por entrega estimada, de la más próxima a la más lejana.
- `npm audit` informa un aviso moderado en `minimatch`, una dependencia interna de ESLint. Solo afecta la herramienta de lint, no al código que se entrega, y la única "corrección" disponible baja `typescript-eslint` a una versión incompatible.

## Qué mejoraría con más tiempo

- Tests de componentes con Testing Library para los flujos de teclado, y algunos e2e con Playwright. Hoy esos flujos se verificaron a mano y con scripts en el navegador.
- Guardar los filtros en la URL para poder compartir una vista, y persistir los cambios en `localStorage`.
- Agrupar marcadores cercanos (clustering) y virtualizar la lista, para volúmenes reales de envíos.
- Un proveedor de tiles con estilo oscuro nativo (con API key) en lugar del filtro CSS.
- Deshacer una cancelación desde el toast y un historial de cambios por envío.
- Una auditoría de accesibilidad con axe y lectores de pantalla reales.
