import type { SVGProps } from 'react';
import { iconData, type IconName } from './iconData';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  name: IconName;
  /** Tamaño en px; por defecto, el del kit. */
  size?: number;
};

export function Icon({ name, size, ...props }: IconProps) {
  const icon = iconData[name];
  const px = size ?? icon.size;
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${icon.size} ${icon.size}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {icon.content}
    </svg>
  );
}
