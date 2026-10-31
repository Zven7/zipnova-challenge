import type { Config } from 'tailwindcss';

/**
 * Tokens extraídos del UI Kit de Figma ("Zipnova Challenge UI").
 * Los nombres entre comillas corresponden a los estilos del archivo.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
      full: '9999px',
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: '#172937',
          deep: '#152532', // "Neutral/Black100"
          canvas: '#41505b',
        },
        surface: {
          DEFAULT: '#233441', // inputs y dropdowns
          raised: '#2e3e4b', // "Neutral/Black80": cards, opciones, botón de filtro
          sunken: '#1e2f3d', // fondo del date picker
          hover: '#354551', // hover de opciones, scrollbar
        },
        line: {
          DEFAULT: '#45545f',
          strong: '#8b949b',
        },
        fg: {
          DEFAULT: '#ffffff', // "Neutral/White"
          soft: '#c5cddd',
          muted: '#8b949b',
          faint: '#5d6973',
        },
        primary: {
          DEFAULT: '#14efb6', // "Primary/Primary100"
          alt: '#3de9a8',
        },
        // No están en el kit: paleta propuesta para estados de envío.
        status: {
          pending: '#f5b544',
          assigned: '#5b9dff',
          'in-transit': '#14efb6',
          delivered: '#8b949b',
          cancelled: '#f26b6b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        tiny: ['11px', '14.3px'], // "TextTiny/normal"
        'tiny-loose': ['11px', '15.4px'],
        small: ['13px', '16px'], // "TextSmall/normal" y "TextSmall/medium"
        'small-loose': ['13px', '18.2px'],
        input: ['13px', '22px'], // "TextSystem/text-inputs-regular"
        body: ['16px', '20.8px'], // "TextRegular/normal"
        'body-loose': ['16px', '22.4px'],
        button: ['16px', '22px'], // "TextSystem/text-button"
        heading: ['40px', '48px'], // "Heading/xxlarge"
      },
      boxShadow: {
        'elevation-1': '-3px 3px 4px 0 #172937',
        'elevation-2': '-4px 6px 7px 0 rgba(23, 41, 55, 0.8)',
      },
    },
  },
} satisfies Config;
