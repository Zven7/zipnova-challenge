import type { ReactNode } from 'react';

type ExampleSectionProps = { title: string; children: ReactNode };

export function ExampleSection({ title, children }: ExampleSectionProps) {
  return (
    <section className="mt-16">
      <h2 className="text-body-loose font-semibold">{title}</h2>
      <div className="mt-8 flex flex-wrap items-start gap-x-20 gap-y-12">{children}</div>
    </section>
  );
}
