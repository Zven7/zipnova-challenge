import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { includesText } from '@/lib/text';
import { Icon } from './Icon';

type SuggestionSearchProps = {
  /** Nombre accesible del buscador. */
  label: string;
  placeholder?: string;
  /** Texto que se muestra antes de escribir. */
  hint: string;
  noResultsLabel?: string;
  suggestions: string[];
  maxResults?: number;
  defaultQuery?: string;
  /** Recibe la sugerencia elegida o, con Enter sin selección, el texto escrito. */
  onSelect: (value: string) => void;
  className?: string;
};

/** Buscador con sugerencias, usado como submenú del Filtro. */
export function SuggestionSearch({
  label,
  placeholder = 'Buscar...',
  hint,
  noResultsLabel = 'Sin resultados',
  suggestions,
  maxResults = 6,
  defaultQuery = '',
  onSelect,
  className,
}: SuggestionSearchProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState(defaultQuery);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = query.trim();
  const results =
    trimmed === ''
      ? []
      : suggestions.filter((suggestion) => includesText(suggestion, trimmed)).slice(0, maxResults);

  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [id, activeIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const value = results[activeIndex] ?? trimmed;
      if (value !== '') onSelect(value);
    }
  }

  const message = trimmed === '' ? hint : results.length === 0 ? noResultsLabel : undefined;

  return (
    <div
      className={cn(
        'w-[254px] overflow-hidden rounded-lg border border-line bg-surface shadow-elevation-2',
        className,
      )}
    >
      <div className="flex h-[37px] items-center gap-3 border-b border-line px-4">
        <input
          type="text"
          role="combobox"
          autoComplete="off"
          aria-label={label}
          aria-expanded={results.length > 0}
          aria-controls={results.length > 0 ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-input font-normal text-fg placeholder:text-fg-muted focus-visible:outline-none"
        />
        <Icon name="search" className="shrink-0 text-fg-muted" />
      </div>

      <div className="p-1">
        {message !== undefined ? (
          <p
            className="flex h-8 items-center p-2 text-small font-light text-fg-soft"
            aria-live="polite"
          >
            {message}
          </p>
        ) : (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="scrollbar-kit max-h-[200px] overflow-y-auto"
          >
            {results.map((result, index) => (
              <li
                key={result}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                data-active={activeIndex === index}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
                onClick={() => {
                  onSelect(result);
                }}
                className="flex min-h-8 cursor-pointer items-center rounded-md p-2 text-small font-light text-fg-soft data-[active=true]:bg-surface-raised"
              >
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
