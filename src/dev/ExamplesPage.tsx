import { useState } from 'react';
import { DatePicker } from '@/components/ui/DatePicker';
import { FilterMenu, type FilterMenuItem } from '@/components/ui/FilterMenu';
import { MultiSelect, type SelectOption } from '@/components/ui/MultiSelect';
import { SuggestionSearch } from '@/components/ui/SuggestionSearch';
import { ExampleSection } from './ExampleSection';
import { ExampleState } from './ExampleState';

const options: SelectOption<string>[] = [1, 2, 3, 4, 5].map((n) => ({
  value: `option-${n}`,
  label: `Opción ${n}`,
}));

const addresses = [
  'Av. Corrientes 1234, San Nicolás, CABA',
  'Av. Santa Fe 3253, Palermo, CABA',
  'Av. Cabildo 2040, Belgrano, CABA',
  'Defensa 1200, San Telmo, CABA',
];

// Mismo estado que el kit: hoy es 3/7/2026 y está seleccionado el 6/7/2026.
const KIT_TODAY = new Date(2026, 6, 3);
const KIT_DATE = '2026-07-06';

const labels = { label: 'Etiqueta', secondLabel: 'Etiqueta secundaria', hint: 'Texto de ayuda' };

/** Página de ejemplos de los componentes del kit con todos sus estados (#dev). */
export function ExamplesPage() {
  const [interactive, setInteractive] = useState<string[]>([]);
  const [selected, setSelected] = useState(['option-1', 'option-2', 'option-3']);
  const [date, setDate] = useState<string | undefined>(KIT_DATE);
  const [address, setAddress] = useState<string>();

  const filterItems: FilterMenuItem[] = [
    {
      id: 'address',
      label: 'Dirección',
      icon: 'locate',
      render: ({ close }) => (
        <SuggestionSearch
          label="Buscar dirección"
          hint="Escribe y selecciona una dirección"
          suggestions={addresses}
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
    <main className="min-h-full bg-bg-canvas p-6 sm:p-12">
      <header className="rounded-2xl bg-bg px-5 py-12">
        <p className="flex items-center gap-2 text-body font-light">
          Design system <span className="size-1 rounded-full bg-primary" /> Componentes del
          challenge
        </p>
        <h1 className="mt-2 text-heading font-semibold">UI Kit</h1>
      </header>

      <ExampleSection title="Selección múltiple con búsqueda">
        <ExampleState title="Por defecto">
          <MultiSelect {...labels} options={options} value={[]} onChange={() => undefined} />
        </ExampleState>
        <ExampleState title="Activo (pasa el mouse por las opciones)">
          <MultiSelect
            {...labels}
            options={options}
            value={[]}
            onChange={() => undefined}
            defaultOpen
          />
        </ExampleState>
        <ExampleState title="Buscando sin resultados">
          <MultiSelect
            {...labels}
            options={options}
            value={[]}
            onChange={() => undefined}
            defaultQuery="CA"
          />
        </ExampleState>
        <ExampleState title="Buscando con resultados">
          <MultiSelect
            {...labels}
            options={options}
            value={[]}
            onChange={() => undefined}
            defaultQuery="Op"
          />
        </ExampleState>
        <ExampleState title="Opciones seleccionadas">
          <MultiSelect
            {...labels}
            hideLabel
            options={options}
            value={selected}
            onChange={setSelected}
            defaultQuery="Op"
          />
        </ExampleState>
        <ExampleState title="Interactivo">
          <MultiSelect
            {...labels}
            options={options}
            value={interactive}
            onChange={setInteractive}
          />
        </ExampleState>
      </ExampleSection>

      <ExampleSection title="Filtro">
        <ExampleState title="Por defecto (pasa el mouse para el hover)" width="narrow">
          <FilterMenu label="Filtros" items={filterItems} />
        </ExampleState>
        <ExampleState title="Activo, nivel 1" width="narrow">
          <FilterMenu label="Filtros" items={filterItems} defaultOpen />
        </ExampleState>
        <ExampleState title="Activo, submenú de dirección" width="wide">
          <FilterMenu label="Filtros" items={filterItems} defaultOpenItemId="address" />
        </ExampleState>
        <ExampleState title="Activo, submenú de fecha" width="wide">
          <FilterMenu label="Filtros" items={filterItems} defaultOpenItemId="date" />
        </ExampleState>
        <ExampleState title="Valores elegidos" width="narrow">
          <p className="text-small text-fg-soft">Dirección: {address ?? '—'}</p>
          <p className="text-small text-fg-soft">Fecha: {date ?? '—'}</p>
        </ExampleState>
      </ExampleSection>

      <ExampleSection title="Submenús sueltos">
        <ExampleState title="Buscador de dirección">
          <SuggestionSearch
            label="Buscar dirección"
            hint="Escribe y selecciona una dirección"
            suggestions={addresses}
            onSelect={setAddress}
          />
        </ExampleState>
        <ExampleState title="Date picker">
          <DatePicker label="Fecha" value={date} onChange={setDate} today={KIT_TODAY} />
        </ExampleState>
      </ExampleSection>
    </main>
  );
}
