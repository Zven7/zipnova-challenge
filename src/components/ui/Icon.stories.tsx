import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { iconData, type IconName } from './iconData';

const names = Object.keys(iconData) as IconName[];

function IconGallery() {
  return (
    <ul className="grid w-[600px] grid-cols-4 gap-4">
      {names.map((name) => (
        <li
          key={name}
          className="flex flex-col items-center gap-2 rounded-md bg-surface-raised p-3 text-tiny text-fg-soft"
        >
          <Icon name={name} className="text-fg" />
          {name}
        </li>
      ))}
    </ul>
  );
}

const meta = {
  title: 'Otros componentes/Íconos del kit',
  component: IconGallery,
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todos: Story = {};
