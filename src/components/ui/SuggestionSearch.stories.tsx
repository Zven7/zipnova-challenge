import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { sampleAddresses } from './storyData';
import { SuggestionSearch } from './SuggestionSearch';

const meta = {
  title: 'Kit de Figma/Filtro/Buscador de dirección',
  component: SuggestionSearch,
  args: {
    label: 'Buscar dirección',
    hint: 'Escribe y selecciona una dirección',
    suggestions: sampleAddresses,
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-[240px] w-[340px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SuggestionSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PorDefecto: Story = { name: 'Por defecto' };

export const ConResultados: Story = { name: 'Con resultados', args: { defaultQuery: 'Av' } };

export const SinResultados: Story = { name: 'Sin resultados', args: { defaultQuery: 'Rosario' } };
