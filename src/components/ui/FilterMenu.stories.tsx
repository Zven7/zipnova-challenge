import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { FilterMenu, type FilterMenuItem } from './FilterMenu';
import { SuggestionSearch } from './SuggestionSearch';
import { KIT_DATE, KIT_TODAY, sampleAddresses } from './storyData';

type DemoProps = { defaultOpen?: boolean; defaultOpenItemId?: string };

/** El menú con sus dos submenús, como en el kit. Muestra debajo lo que se eligió. */
function FilterMenuDemo({ defaultOpen, defaultOpenItemId }: DemoProps) {
  const [address, setAddress] = useState<string>();
  const [date, setDate] = useState<string | undefined>(KIT_DATE);

  const items: FilterMenuItem[] = [
    {
      id: 'address',
      label: 'Dirección',
      icon: 'locate',
      render: ({ close }) => (
        <SuggestionSearch
          label="Buscar dirección"
          hint="Escribe y selecciona una dirección"
          suggestions={sampleAddresses}
          onSelect={(value) => {
            setAddress(value);
            close();
          }}
        />
      ),
    },
    {
      id: 'date',
      label: 'Fecha',
      icon: 'calendar',
      render: () => <DatePicker label="Fecha" value={date} onChange={setDate} today={KIT_TODAY} />,
    },
  ];

  return (
    <div className="flex min-h-[420px] w-[600px] flex-col gap-4">
      <div className="w-[180px]">
        <FilterMenu
          label="Filtros"
          items={items}
          defaultOpen={defaultOpen}
          defaultOpenItemId={defaultOpenItemId}
        />
      </div>
      <p className="mt-auto text-tiny text-fg-muted">
        Dirección: {address ?? '—'} · Fecha: {date ?? '—'}
      </p>
    </div>
  );
}

const meta = {
  title: 'Kit de Figma/Filtro/Menú',
  component: FilterMenuDemo,
} satisfies Meta<typeof FilterMenuDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PorDefecto: Story = { name: 'Por defecto' };

export const ActivoNivel1: Story = { name: 'Activo, nivel 1', args: { defaultOpen: true } };

export const SubmenuDireccion: Story = {
  name: 'Activo, submenú de dirección',
  args: { defaultOpenItemId: 'address' },
};

export const SubmenuFecha: Story = {
  name: 'Activo, submenú de fecha',
  args: { defaultOpenItemId: 'date' },
};
