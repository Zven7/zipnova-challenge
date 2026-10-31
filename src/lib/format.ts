import { addDays, toDateKey } from './date';

const LOCALE = 'es-AR';

const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
const threeDecimals = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false });
const pad = (value: number) => String(value).padStart(2, '0');

/** "60 kg", "3,5 kg". */
export function formatWeight(kg: number): string {
  return `${oneDecimal.format(kg)} kg`;
}

/** "0,200 m3", como en el kit. */
export function formatVolume(m3: number): string {
  return `${threeDecimals.format(m3)} m3`;
}

/** Monto compacto del kit: "$ 950", "$ 230 K", "$ 1,4 M". */
export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$ ${oneDecimal.format(value / 1_000_000)} M`;
  if (value >= 1_000) return `$ ${integer.format(value / 1_000)} K`;
  return `$ ${integer.format(value)}`;
}

/** "Hoy, 16:00", "Mañana, 09:30", "Ayer, 11:00" o "02/11, 10:00". */
export function formatDelivery(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const relativeDays: Record<string, string> = {
    [toDateKey(now)]: 'Hoy',
    [toDateKey(addDays(now, 1))]: 'Mañana',
    [toDateKey(addDays(now, -1))]: 'Ayer',
  };
  const day = relativeDays[toDateKey(date)] ?? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  return `${day}, ${time.format(date)}`;
}

/** "06/07/2026". Se arma a mano porque Intl con es-AR no respeta '2-digit' en el día. */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
