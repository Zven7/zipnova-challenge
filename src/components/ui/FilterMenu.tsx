import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
import type { IconName } from './iconData';
import { useDismiss } from './useDismiss';

export type FilterMenuItem = {
  id: string;
  label: string;
  icon: IconName;
  /** Contenido del submenú. `close` cierra todo el menú y devuelve el foco al botón. */
  render: (api: { close: () => void }) => ReactNode;
};

type FilterMenuProps = {
  /** Nombre accesible del botón y del menú. */
  label: string;
  items: FilterMenuItem[];
  /** Hay filtros aplicados: el ícono queda resaltado aunque el menú esté cerrado. */
  active?: boolean;
  /** Solo para la página de ejemplos. */
  defaultOpen?: boolean;
  defaultOpenItemId?: string;
};

const ITEM_HEIGHT = 32;
const SUBMENU_FOCUS_ORDER = ['[tabindex="0"]', 'input', 'button:not([tabindex="-1"])'];

export function FilterMenu({
  label,
  items,
  active = false,
  defaultOpen = false,
  defaultOpenItemId,
}: FilterMenuProps) {
  const menuId = useId();
  const buttonId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingItemFocus = useRef<number | null>(null);
  const pendingSubmenuFocus = useRef(false);

  const [open, setOpen] = useState(defaultOpen || defaultOpenItemId !== undefined);
  const [openItemId, setOpenItemId] = useState(defaultOpenItemId);
  const openIndex = items.findIndex((item) => item.id === openItemId);
  const openItem = items[openIndex];

  const close = useCallback(() => {
    setOpen(false);
    setOpenItemId(undefined);
  }, []);

  const closeAndFocusButton = useCallback(() => {
    close();
    document.getElementById(buttonId)?.focus();
  }, [close, buttonId]);

  useDismiss(rootRef, close, open);

  useEffect(() => {
    if (!open || pendingItemFocus.current === null) return;
    itemRefs.current[pendingItemFocus.current]?.focus();
    pendingItemFocus.current = null;
  }, [open]);

  useEffect(() => {
    if (!pendingSubmenuFocus.current) return;
    pendingSubmenuFocus.current = false;
    // Prioriza el elemento con foco itinerante (ej. el día del calendario) y después el input.
    const submenu = submenuRef.current;
    const target = SUBMENU_FOCUS_ORDER.map((selector) =>
      submenu?.querySelector<HTMLElement>(selector),
    ).find(Boolean);
    target?.focus();
  }, [openItemId]);

  function focusItem(index: number) {
    const count = items.length;
    setOpenItemId(undefined);
    itemRefs.current[(index + count) % count]?.focus();
  }

  function openSubmenu(itemId: string) {
    pendingSubmenuFocus.current = true;
    setOpenItemId(itemId);
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      pendingItemFocus.current = 0;
      setOpen(true);
    }
  }

  function handleItemKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const item = items[index];
    if (!item) return;
    const actions: Record<string, () => void> = {
      ArrowDown: () => {
        focusItem(index + 1);
      },
      ArrowUp: () => {
        focusItem(index - 1);
      },
      Home: () => {
        focusItem(0);
      },
      End: () => {
        focusItem(items.length - 1);
      },
      ArrowRight: () => {
        openSubmenu(item.id);
      },
      Escape: closeAndFocusButton,
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  function handleSubmenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    const index = openIndex;
    setOpenItemId(undefined);
    itemRefs.current[index]?.focus();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && !rootRef.current?.contains(next)) close();
  }

  return (
    <div ref={rootRef} className="relative" onBlur={handleBlur}>
      <button
        id={buttonId}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) close();
          else setOpen(true);
        }}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          'flex size-9 items-center justify-center rounded-md border border-line bg-bg p-2 transition-colors',
          open || active ? 'text-primary' : 'text-fg-muted hover:bg-surface-raised hover:text-fg',
        )}
      >
        <Icon name="sliders" />
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-40">
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="w-[224px] rounded-lg border border-line bg-surface p-1 shadow-elevation-1"
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-haspopup="dialog"
                aria-expanded={openItemId === item.id}
                data-active={openItemId === item.id}
                onMouseEnter={() => {
                  setOpenItemId(item.id);
                }}
                onClick={() => {
                  openSubmenu(item.id);
                }}
                onKeyDown={(event) => {
                  handleItemKeyDown(event, index);
                }}
                className="flex h-8 w-full items-center justify-between gap-2 rounded-md p-2 text-left focus-visible:bg-surface-raised focus-visible:outline-none data-[active=true]:bg-surface-raised"
              >
                <span className="flex items-center gap-2">
                  <Icon name={item.icon} className="text-fg-muted" />
                  <span className="text-small font-light text-fg-soft">{item.label}</span>
                </span>
                <Icon name="chevron-right" className="text-fg-muted" />
              </button>
            ))}
          </div>

          {openItem && (
            <div
              ref={submenuRef}
              role="dialog"
              aria-label={openItem.label}
              onKeyDown={handleSubmenuKeyDown}
              style={{ top: openIndex * ITEM_HEIGHT }}
              className="absolute left-[222px]"
            >
              {openItem.render({ close: closeAndFocusButton })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
