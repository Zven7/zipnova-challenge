import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    options: {
      // Primero los componentes que pide el kit de Figma; después los de apoyo.
      storySort: {
        order: [
          'Kit de Figma',
          ['Selección múltiple con búsqueda', 'Filtro', ['Menú'], 'Card de envío'],
          'Otros componentes',
        ],
      },
    },
  },
};

export default preview;
