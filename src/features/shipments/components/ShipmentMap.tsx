import 'leaflet/dist/leaflet.css';
import './map.css';
import type { LatLngTuple, Marker as LeafletMarker } from 'leaflet';
import { useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/cn';
import { useMapStyle, type MapStyle } from '../hooks/useMapStyle';
import { selectFilteredShipments, selectSelectedShipmentId } from '../store/selectors';
import { focusShipment } from '../store/shipmentsViewSlice';
import { MapLegend } from './MapLegend';
import { getMarkerIcon } from './markerIcons';
import { ShipmentMapController } from './ShipmentMapController';
import { ShipmentPopup } from './ShipmentPopup';

const BUENOS_AIRES: LatLngTuple = [-34.61, -58.44];
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const styleOptions: { value: MapStyle; label: string }[] = [
  { value: 'dark', label: 'Oscuro' },
  { value: 'light', label: 'Claro' },
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

  const positionsKey = shipments
    .map(({ destination }) => `${destination.lat},${destination.lng}`)
    .join(';');

  return (
    // La clase va en el contenedor: MapContainer solo aplica className al montarse.
    <div className={cn('relative h-full w-full', mapStyle === 'dark' && 'map-dark')}>
      <MapContainer center={BUENOS_AIRES} zoom={11} className="h-full w-full">
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
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
          label="Estilo del mapa"
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
