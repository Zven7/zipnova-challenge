import type { ReactNode } from 'react';

type ExampleStateProps = {
  title: string;
  width?: 'narrow' | 'default' | 'card' | 'wide';
  children: ReactNode;
};

const widths = { narrow: 'w-[180px]', default: 'w-[340px]', card: 'w-[378px]', wide: 'w-[560px]' };

export function ExampleState({ title, width = 'default', children }: ExampleStateProps) {
  return (
    <div className={widths[width]}>
      <h3 className="mb-4 text-tiny-loose font-semibold">{title}</h3>
      <div className="flex min-h-[340px] flex-col gap-2">{children}</div>
    </div>
  );
}
