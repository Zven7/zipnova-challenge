import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { LoadedStoreProvider } from '@/test/LoadedStoreProvider';
import { expandShipment, selectShipment } from '../store/shipmentsViewSlice';
import { ShipmentCard } from './ShipmentCard';

type DemoProps = { id: string; expanded?: boolean; selected?: boolean };

function ShipmentCardDemo({ id, expanded, selected }: DemoProps) {
  return (
    <LoadedStoreProvider
      setup={(store) => {
        if (expanded) store.dispatch(expandShipment(id));
        if (selected) store.dispatch(selectShipment(id));
      }}
    >
      <div className="w-[378px]">
        <ShipmentCard id={id} onLocate={fn()} onOpenActions={fn()} />
      </div>
    </LoadedStoreProvider>
  );
}

const meta = {
  title: 'Kit de Figma/Card de envío',
  component: ShipmentCardDemo,
} satisfies Meta<typeof ShipmentCardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

// 123445 es el número de entrega que muestra el kit.
export const Colapsada: Story = { args: { id: '123445' } };

export const Expandida: Story = {
  name: 'Expandida (con el bloque de detalle agregado)',
  args: { id: '123445', expanded: true },
};

export const ExpandidaAsignada: Story = {
  name: 'Expandida, con conductor y vehículo',
  args: { id: '123491', expanded: true },
};

export const Seleccionada: Story = {
  name: 'Seleccionada (después de "Ubicar en el mapa")',
  args: { id: '123445', selected: true },
};
