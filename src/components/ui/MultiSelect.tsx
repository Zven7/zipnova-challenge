import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { includesText } from '@/lib/text';
import { CheckboxIndicator } from './CheckboxIndicator';
import { Icon } from './Icon';
import { useDismiss } from './useDismiss';

export type SelectOption<T extends string> = { value: T; label: string };

type MultiSelectProps<T extends string> = {
  label: string;
  secondLabel?: string;
  hint?: string;
  /** Oculta la fila de etiquetas pero la mantiene para lectores de pantalla. */
  hideLabel?: boolean;
  placeholder?: string;
  options: SelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  selectAllLabel?: string;
  groupLabel?: string;
  noOptionsLabel?: string;
  /** Solo para la página de ejemplos: arranca abierto o con una búsqueda escrita. */
  defaultOpen?: boolean;
  defaultQuery?: string;
  className?: string;
};

const SELECT_ALL_INDEX = 0;

export function MultiSelect<T extends string>({
  label,
  secondLabel,
  hint,
  hideLabel = false,
  placeholder = 'Buscar',
  options,
  value,
  onChange,
  selectAllLabel = 'Seleccionar todo',
  groupLabel = 'Selecciona opciones',
  noOptionsLabel = 'Sin opciones',
  defaultOpen = false,
  defaultQuery = '',
  className,
}: MultiSelectProps<T>) {
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const groupLabelId = `${id}-group`;
  const hintId = `${id}-hint`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(defaultOpen || defaultQuery !== '');
  const [query, setQuery] = useState(defaultQuery);
  // Índice navegable: 0 es "Seleccionar todo", 1..n son las opciones filtradas.
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = options.filter((option) => includesText(option.label, query));
  const itemCount = filtered.length > 0 ? filtered.length + 1 : 0;
  const allSelected =
    filtered.length > 0 && filtered.every((option) => value.includes(option.value));

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useDismiss(rootRef, close, open);

  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [id, activeIndex]);

  function toggle(optionValue: T) {
    onChange(
      value.includes(optionValue)
        ? value.filter((selected) => selected !== optionValue)
        : [...value, optionValue],
    );
  }

  function toggleAll() {
    const filteredValues = filtered.map((option) => option.value);
    onChange(
      allSelected
        ? value.filter((selected) => !filteredValues.includes(selected))
        : [...value, ...filteredValues.filter((optionValue) => !value.includes(optionValue))],
    );
  }

  function activate(index: number) {
    if (index === SELECT_ALL_INDEX) toggleAll();
    else {
      const option = filtered[index - 1];
      if (option) toggle(option.value);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        if (itemCount > 0) setActiveIndex((index) => (index + 1) % itemCount);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        if (itemCount > 0) setActiveIndex((index) => (index <= 0 ? itemCount - 1 : index - 1));
        break;
      case 'Home':
      case 'End':
        if (!open || itemCount === 0) return;
        event.preventDefault();
        setActiveIndex(event.key === 'Home' ? 0 : itemCount - 1);
        break;
      case 'Enter':
        if (!open) {
          setOpen(true);
        } else if (activeIndex >= 0) {
          event.preventDefault();
          activate(activeIndex);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close();
        } else if (query !== '') {
          setQuery('');
        }
        break;
    }
  }

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === options.length
        ? 'Todos'
        : selectedLabels.join(', ');

  return (
    <div ref={rootRef} className={cn('flex w-full flex-col gap-2', className)}>
      <div className={cn('flex items-end justify-between gap-1', hideLabel && 'sr-only')}>
        <label htmlFor={inputId} className="text-small font-light text-fg">
          {label}
        </label>
        {secondLabel && <span className="text-tiny font-light text-fg">{secondLabel}</span>}
      </div>

      <div className="relative">
        <div
          className={cn(
            'flex h-[38px] items-center gap-3 border border-line bg-surface px-4 py-2',
            open
              ? 'rounded-t-xl'
              : 'rounded-full has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-primary',
          )}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-describedby={hint ? hintId : undefined}
            value={query}
            placeholder={open ? placeholder : summary}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onClick={() => {
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'min-w-0 flex-1 truncate bg-transparent text-input font-normal text-fg focus-visible:outline-none',
              !open && selectedLabels.length > 0
                ? 'placeholder:text-fg'
                : 'placeholder:text-fg-muted',
            )}
          />
          {query !== '' && (
            <button
              type="button"
              aria-label="Borrar búsqueda"
              onClick={() => {
                setQuery('');
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="shrink-0 rounded-xs text-fg"
            >
              <Icon name="x" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-label={open ? 'Cerrar opciones' : 'Abrir opciones'}
            onClick={() => {
              if (open) close();
              else setOpen(true);
              inputRef.current?.focus();
            }}
            className="shrink-0 text-fg-muted"
          >
            <Icon name={open ? 'chevron-up' : 'chevron-down'} />
          </button>
        </div>

        {open && (
          <div className="absolute inset-x-0 top-full z-30 rounded-b-xl border border-t-0 border-line bg-surface">
            <ul
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              aria-label={label}
              onMouseLeave={() => {
                setActiveIndex(-1);
              }}
            >
              {filtered.length === 0 ? (
                <li
                  role="presentation"
                  className="px-4 py-3 text-center text-small font-light text-fg"
                >
                  {noOptionsLabel}
                </li>
              ) : (
                <>
                  <li role="presentation" className="p-1">
                    <div
                      id={optionId(SELECT_ALL_INDEX)}
                      role="option"
                      aria-selected={allSelected}
                      data-active={activeIndex === SELECT_ALL_INDEX}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onMouseEnter={() => {
                        setActiveIndex(SELECT_ALL_INDEX);
                      }}
                      onClick={toggleAll}
                      className="group flex h-8 cursor-pointer items-center gap-2 rounded-md p-2 data-[active=true]:bg-surface-raised"
                    >
                      <CheckboxIndicator
                        checked={allSelected}
                        className={cn(
                          !allSelected && 'opacity-0 group-data-[active=true]:opacity-100',
                        )}
                      />
                      <span className="text-small font-light text-fg">{selectAllLabel}</span>
                    </div>
                  </li>
                  <li role="presentation" className="border-t-[0.5px] border-line pt-1">
                    <span
                      id={groupLabelId}
                      className="block px-2 py-1 text-tiny font-light text-fg-soft"
                    >
                      {groupLabel}
                    </span>
                    <ul
                      role="group"
                      aria-labelledby={groupLabelId}
                      className="scrollbar-kit max-h-[168px] overflow-y-auto py-1 pr-2 pl-1"
                    >
                      {filtered.map((option, position) => {
                        const index = position + 1;
                        const selected = value.includes(option.value);
                        return (
                          <li
                            key={option.value}
                            id={optionId(index)}
                            role="option"
                            aria-selected={selected}
                            data-active={activeIndex === index}
                            onMouseDown={(event) => {
                              event.preventDefault();
                            }}
                            onMouseEnter={() => {
                              setActiveIndex(index);
                            }}
                            onClick={() => {
                              toggle(option.value);
                            }}
                            className="group flex h-8 cursor-pointer items-center gap-2 rounded-lg p-2 data-[active=true]:bg-surface-raised"
                          >
                            <CheckboxIndicator
                              checked={selected}
                              className={cn(
                                !selected && 'opacity-0 group-data-[active=true]:opacity-100',
                              )}
                            />
                            <span className="truncate text-small font-light text-fg">
                              {option.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {hint && (
        <p id={hintId} className="text-tiny font-light text-fg">
          {hint}
        </p>
      )}
    </div>
  );
}
