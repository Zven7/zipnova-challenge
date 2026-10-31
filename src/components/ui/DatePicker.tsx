import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import {
  addDays,
  addMonths,
  getCalendarWeeks,
  isSameMonth,
  parseDateKey,
  toDateKey,
} from '@/lib/date';
import { Icon } from './Icon';

type DatePickerProps = {
  /** Nombre accesible del calendario. */
  label: string;
  /** Día seleccionado, "YYYY-MM-DD". */
  value?: string;
  /** Recibe el día elegido, o `undefined` si se vuelve a elegir el seleccionado. */
  onChange: (value: string | undefined) => void;
  today?: Date;
  className?: string;
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const pad = (value: number) => String(value).padStart(2, '0');

export function DatePicker({
  label,
  value,
  onChange,
  today = new Date(),
  className,
}: DatePickerProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldFocusCursor = useRef(false);
  // El cursor es el día enfocado: define el mes visible y lo que muestra el encabezado.
  const [cursor, setCursor] = useState(() => (value ? parseDateKey(value) : today));

  const todayKey = toDateKey(today);
  const cursorKey = toDateKey(cursor);
  const weeks = getCalendarWeeks(cursor);

  useEffect(() => {
    if (!shouldFocusCursor.current) return;
    shouldFocusCursor.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${cursorKey}"]`)?.focus();
  }, [cursorKey]);

  function moveCursor(next: Date, focus: boolean) {
    shouldFocusCursor.current = focus;
    setCursor(next);
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(cursor, -1),
      ArrowRight: () => addDays(cursor, 1),
      ArrowUp: () => addDays(cursor, -7),
      ArrowDown: () => addDays(cursor, 7),
      Home: () => addDays(cursor, -cursor.getDay()),
      End: () => addDays(cursor, 6 - cursor.getDay()),
      PageUp: () => addMonths(cursor, -1),
      PageDown: () => addMonths(cursor, 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveCursor(move(), true);
  }

  return (
    <div
      className={cn(
        'w-[292px] rounded-lg border border-line bg-surface p-[7px] shadow-elevation-2',
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex h-11 items-center justify-between rounded-sm border border-line bg-surface-sunken p-[13px]">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() => {
              moveCursor(addMonths(cursor, -1), false);
            }}
            className="rounded-xs text-fg"
          >
            <Icon name="arrow-left" />
          </button>
          <p
            className="flex items-center gap-2 text-small font-light text-fg-soft"
            aria-hidden="true"
          >
            <span>{pad(cursor.getDate())}</span>
            <span>/</span>
            <span>{pad(cursor.getMonth() + 1)}</span>
            <span>/</span>
            <span>{cursor.getFullYear()}</span>
          </p>
          <span className="sr-only" aria-live="polite">
            {monthFormatter.format(cursor)}
          </span>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() => {
              moveCursor(addMonths(cursor, 1), false);
            }}
            className="rounded-xs text-fg"
          >
            <Icon name="arrow-right" />
          </button>
        </div>

        <div
          ref={gridRef}
          role="grid"
          aria-label={`${label}, ${monthFormatter.format(cursor)}`}
          className="flex flex-col gap-2"
        >
          <div role="row" className="grid grid-cols-7 gap-x-2">
            {WEEKDAYS.map((weekday, index) => (
              <span
                key={weekday}
                role="columnheader"
                aria-label={WEEKDAY_NAMES[index]}
                className="flex h-8 items-center justify-center text-small font-light text-fg-soft"
              >
                {weekday}
              </span>
            ))}
          </div>
          <div role="presentation" className="mx-0.5 border-t-[0.5px] border-line" />
          {weeks.map((week) => (
            <div key={toDateKey(week[0] ?? cursor)} role="row" className="grid grid-cols-7 gap-x-2">
              {week.map((day) => {
                const key = toDateKey(day);
                const selected = key === value;
                const inMonth = isSameMonth(day, cursor);
                return (
                  <div key={key} role="gridcell" aria-selected={selected}>
                    <button
                      type="button"
                      data-date={key}
                      tabIndex={key === cursorKey ? 0 : -1}
                      aria-label={dayFormatter.format(day)}
                      aria-current={key === todayKey ? 'date' : undefined}
                      onClick={() => {
                        moveCursor(day, false);
                        onChange(selected ? undefined : key);
                      }}
                      onKeyDown={handleDayKeyDown}
                      className={cn(
                        'relative flex h-8 w-full items-center justify-center text-small font-light',
                        selected
                          ? 'rounded-full bg-primary text-bg'
                          : cn(
                              'rounded-sm hover:bg-surface-raised',
                              inMonth ? 'text-fg-soft' : 'text-fg-faint',
                            ),
                      )}
                    >
                      {day.getDate()}
                      {key === todayKey && !selected && (
                        <span className="absolute top-[26.5px] left-1/2 size-0.5 -translate-x-1/2 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
