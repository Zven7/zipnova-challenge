# Prueba técnica

## El desafío

El operador necesita una herramienta que le permita tener una visión general de los envíos que se encuentran actualmente en operación.

La aplicación debe combinar:

- Un listado de envíos.
- Un mapa con información geográfica.
- Filtros y búsqueda.
- Información de detalle.
- Acciones sobre los envíos.

El objetivo no es construir una aplicación completa de gestión logística, sino resolver de manera clara y mantenible este flujo principal.

## Usuario

El usuario principal de la aplicación es un operador logístico.

Durante el día, el operador necesita responder preguntas como:

- ¿Qué envíos están pendientes?
- ¿Qué envíos tienen prioridad alta?
- ¿Qué conductor y vehículo están asignados a un envío?
- ¿Dónde se encuentran geográficamente las operaciones?

La interfaz debería permitir responder estas preguntas rápidamente.

## Datos

No es necesario desarrollar un backend.

Creá un dataset mock de unos **20 envíos**, **5 conductores** y **5 vehículos**.

Por ejemplo:

```ts
type Shipment = {
  id: string;
  customer: string;

  destination: {
    lat: number;
    lng: number;
    address: string;
  };

  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

  priority: 'low' | 'medium' | 'high';

  driverId?: string;
  vehicleId?: string;

  estimatedDelivery: string;
};
```

Podés modificar o extender este modelo si considerás que es necesario.

## Requerimientos técnicos

La solución debe utilizar:

- React
- TypeScript
- Tailwind CSS
- Redux / Redux Toolkit
- React Hook Form

Para el mapa podés utilizar la tecnología/librería que consideres apropiada.

Por ejemplo:

- Leaflet.
- Mapbox.
- Google Maps.
- OpenStreetMap.
- Otra alternativa.

No es necesario implementar routing real ni calcular rutas óptimas.

## Diseño

Partimos de un design system propio. En este archivo de Figma vas a encontrar el UI Kit con los componentes base de la aplicación:

[UI Kit – Challenge components (Figma)](https://www.figma.com/design/tlkkTgzDQvgITnIU7myB72/Challenge-UI?node-id=6-1276&t=QZwZhdhDHF9yAcgM-0)

La consigna es desarrollar la aplicación a partir de este diseño de componentes. El kit incluye:

- **Selección múltiple con búsqueda**: con sus estados default, activo, búsqueda con y sin resultados, y opciones seleccionadas (incluida la opción "Select all").
- **Filtro**: un botón que abre un menú con submenús. Cada submenú contiene un buscador de dirección o un date picker.
- **Card de envío**: tiene una versión colapsada (número de envío y acción para ubicarlo en el mapa) y una versión expandida (métricas de peso, volumen, bultos y valor, detalle de paquetes y asignación).
