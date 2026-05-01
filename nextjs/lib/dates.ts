// Helpers de fecha y filtrado
import type { SonoraEvent } from './data';

export const TODAY = new Date(2026, 4, 4);

export const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
export const MONTH_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
export const WEEKDAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function startOfWeek(d: Date): Date {
  const day = (d.getDay() + 6) % 7;
  const r = new Date(d);
  r.setDate(d.getDate() - day);
  return r;
}

export function isWithinWeek(eventDate: Date, ref: Date): boolean {
  const start = startOfWeek(ref);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return eventDate >= start && eventDate <= end;
}

export function isWithinMonth(eventDate: Date, ref: Date): boolean {
  return eventDate.getFullYear() === ref.getFullYear() &&
    eventDate.getMonth() === ref.getMonth();
}

export function relativeDayLabel(d: Date): string | null {
  const diff = Math.round((d.getTime() - TODAY.getTime()) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  return null;
}

export type DateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'weekend';

export function applyDateFilter(events: SonoraEvent[], filter: DateFilter, refDate: Date): SonoraEvent[] {
  return events.filter(e => {
    const d = parseDate(e.date);
    if (filter === 'today') return sameDay(d, TODAY);
    if (filter === 'tomorrow') {
      const t = new Date(TODAY);
      t.setDate(t.getDate() + 1);
      return sameDay(d, t);
    }
    if (filter === 'week') return isWithinWeek(d, TODAY);
    if (filter === 'month') return isWithinMonth(d, refDate);
    if (filter === 'weekend') {
      const dow = (d.getDay() + 6) % 7;
      return dow >= 5 && isWithinWeek(d, TODAY);
    }
    return true;
  });
}
