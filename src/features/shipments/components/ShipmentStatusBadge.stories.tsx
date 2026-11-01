import type { Meta, StoryObj } from '@storybook/react-vite';
import { SHIPMENT_STATUSES } from '../types';
import { MapLegend } from './MapLegend';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

function StatusGallery() {
  return (
    <div className="flex items-start gap-8">
      <ul className="flex flex-col gap-2">
        {SHIPMENT_STATUSES.map((status) => (
          <li key={status}>
            <ShipmentStatusBadge status={status} />
          </li>
        ))}
      </ul>
      <MapLegend />
    </div>
  );
}

const meta = {
  title: 'Otros componentes/Estados del envío',
  component: StatusGallery,
} satisfies Meta<typeof StatusGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BadgesYLeyenda: Story = { name: 'Badges y leyenda del mapa' };
