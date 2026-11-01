import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { MultiSelect, type SelectOption } from './MultiSelect';

const options: SelectOption<string>[] = [1, 2, 3, 4, 5].map((n) => ({
  value: `option-${n}`,
  label: `Opción ${n}`,
}));

type DemoProps = Omit<ComponentProps<typeof MultiSelect<string>>, 'value' | 'onChange'> & {
  initialValue?: string[];
};

/** Maneja la selección para que cada estado siga siendo interactivo. */
function MultiSelectDemo({ initialValue = [], ...props }: DemoProps) {
  const [value, setValue] = useState(initialValue);
  return <MultiSelect {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Kit de Figma/Selección múltiple con búsqueda',
  component: MultiSelectDemo,
  args: {
    label: 'Etiqueta',
    secondLabel: 'Etiqueta secundaria',
    hint: 'Texto de ayuda',
    options,
  },
  decorators: [
    (Story) => (
      <div className="min-h-[340px] w-[340px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiSelectDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PorDefecto: Story = { name: 'Por defecto' };

export const Activo: Story = { args: { defaultOpen: true } };

export const BuscandoConResultados: Story = {
  name: 'Buscando con resultados',
  args: { defaultQuery: 'Op' },
};

export const BuscandoSinResultados: Story = {
  name: 'Buscando sin resultados',
  args: { defaultQuery: 'CA' },
};

export const OpcionesSeleccionadas: Story = {
  name: 'Opciones seleccionadas',
  args: {
    hideLabel: true,
    defaultQuery: 'Op',
    initialValue: ['option-1', 'option-2', 'option-3'],
  },
};
