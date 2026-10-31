import { useId } from 'react';
import { Icon } from './Icon';

type SearchInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/** Buscador de texto libre con el estilo del input del kit (píldora de 38px). */
export function SearchInput({ label, value, onChange, placeholder = 'Buscar' }: SearchInputProps) {
  const id = useId();
  return (
    <div className="flex h-[38px] min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-surface px-4 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-primary">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="min-w-0 flex-1 bg-transparent text-input font-normal text-fg placeholder:text-fg-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value === '' ? (
        <Icon name="search" className="shrink-0 text-fg-muted" />
      ) : (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onClick={() => {
            onChange('');
          }}
          className="shrink-0 rounded-xs text-fg"
        >
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}
