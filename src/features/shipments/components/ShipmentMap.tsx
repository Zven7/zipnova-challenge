import 'leaflet/dist/leaflet.css';
import './map.css';
import type { LatLngTuple, Marker as LeafletMarker } from 'leaflet';
import { useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useMapStyle, type MapStyle } from '../hooks/useMapStyle';
import { selectFilteredShipments, selectSelectedShipmentId } from '../store/selectors';
import { focusShipment } from '../store/shipmentsViewSlice';
import { MapLegend } from './MapLegend';
import { getMarkerIcon } from './markerIcons';
import { ShipmentMapController } from './ShipmentMapController';
import { ShipmentPopup } from './ShipmentPopup';

const BUENOS_AIRES: LatLngTuple = [-34.61, -58.44];
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const ESRI_CANVAS = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';

type TileConfig = {
  layers: { url: string; opacity?: number }[];
  attribution: string;
  maxNativeZoom: number;
};

/**
 * Esri Dark Gray tiene poco detalle y deja que resalten los marcadores; las etiquetas van en una
 * capa aparte, atenuada para que no compitan con ellos. OSM es el mapa estándar.
 */
const tileConfigs: Record<MapStyle, TileConfig> = {
  simple: {
    layers: [
      { url: `${ESRI_CANVAS}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}` },
      { url: `${ESRI_CANVAS}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, opacity: 0.55 },
    ],
    attribution: `Tiles &copy; Esri &mdash; Esri, HERE, Garmin, ${OSM_ATTRIBUTION}`,
    maxNativeZoom: 16,
  },
  detailed: {
    layers: [{ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' }],
    attribution: OSM_ATTRIBUTION,
    maxNativeZoom: 19,
  },
};

const styleOptions: { value: MapStyle; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'detailed', label: 'Detallado' },
];

type ShipmentMapProps = {
  /** Si el mapa está a la vista (en mobile vive en una pestaña). */
  visible: boolean;
  onShowInList: (id: string) => void;
};

export function ShipmentMap({ visible, onShowInList }: ShipmentMapProps) {
  const dispatch = useAppDispatch();
  const shipments = useAppSelector(selectFilteredShipments);
  const selectedId = useAppSelector(selectSelectedShipmentId);
  const [mapStyle, setMapStyle] = useMapStyle();
  const markerRefs = useRef(new Map<string, LeafletMarker>());
  const tiles = tileConfigs[mapStyle];

  const positionsKey = shipments
    .map(({ destination }) => `${destination.lat},${destination.lng}`)
    .join(';');

  return (
    <div className="relative h-full w-full">
      <MapContainer center={BUENOS_AIRES} zoom={11} className="h-full w-full">
        {tiles.layers.map(({ url, opacity }) => (
          // TileLayer no actualiza la atribución al cambiar props: la key fuerza a montarlo de nuevo.
          <TileLayer
            key={url}
            url={url}
            opacity={opacity}
            attribution={tiles.attribution}
            maxNativeZoom={tiles.maxNativeZoom}
            maxZoom={19}
          />
        ))}
        {shipments.map((shipment) => {
          const selected = shipment.id === selectedId;
          return (
            <Marker
              key={shipment.id}
              position={[shipment.destination.lat, shipment.destination.lng]}
              icon={getMarkerIcon(shipment.status, selected)}
              title={`Entrega ${shipment.id}`}
              alt={`Entrega ${shipment.id}, ${shipment.customer}`}
              zIndexOffset={selected ? 1000 : 0}
              ref={(marker) => {
                if (marker) markerRefs.current.set(shipment.id, marker);
                else markerRefs.current.delete(shipment.id);
              }}
              eventHandlers={{
                click: () => {
                  dispatch(focusShipment(shipment.id));
                },
              }}
            >
              <Popup>
                <ShipmentPopup shipment={shipment} onShowInList={onShowInList} />
              </Popup>
            </Marker>
          );
        })}
        <ShipmentMapController
          positionsKey={positionsKey}
          markerRefs={markerRefs}
          visible={visible}
        />
      </MapContainer>

      <div className="absolute top-3 right-3 z-[1000]">
        <SegmentedControl
          label="Nivel de detalle del mapa"
          options={styleOptions}
          value={mapStyle}
          onChange={setMapStyle}
        />
      </div>
      <div className="absolute bottom-6 left-3 z-[1000]">
        <MapLegend />
      </div>
    </div>
  );
}
