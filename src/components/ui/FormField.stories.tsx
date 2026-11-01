import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from './FormField';
import { Select } from './Select';
import { TextArea } from './TextArea';

const driverOptions = [
  { value: 'drv-1', label: 'Martín Gómez · +54 9 11 4521-3390' },
  { value: 'drv-4', label: 'Valeria Sosa · +54 9 11 6233-4598' },
];

const meta = {
  title: 'Otros componentes/Campo de formulario',
  component: FormField,
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectConAyuda: Story = {
  name: 'Select con ayuda',
  args: {
    id: 'story-driver',
    label: 'Conductor',
    hint: 'Cada conductor usa un solo vehículo por día.',
    children: (control) => (
      <Select {...control} placeholder="Elige un conductor" options={driverOptions} />
    ),
  },
};

export const SelectConError: Story = {
  name: 'Select con error',
  args: {
    id: 'story-driver-error',
    label: 'Conductor',
    error: 'Elige un conductor.',
    children: (control) => (
      <Select {...control} placeholder="Elige un conductor" options={driverOptions} />
    ),
  },
};

export const AreaDeTexto: Story = {
  name: 'Área de texto',
  args: {
    id: 'story-reason',
    label: 'Motivo (opcional)',
    hint: '0/200 caracteres',
    children: (control) => (
      <TextArea {...control} maxLength={200} placeholder="Ej.: el cliente reprogramó la entrega" />
    ),
  },
};
