import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Envíos en operación · Componentes',
    colorPrimary: '#14efb6',
    colorSecondary: '#14efb6',
    appBg: '#152532',
    appContentBg: '#172937',
    appBorderColor: '#2e3e4b',
  }),
});
