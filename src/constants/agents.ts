import type { AgentStatus, Queue } from '../types/agent';

export const QUEUES: readonly Queue[] = ['Audits', 'LoadRule', 'Insurance'];

export const STATUSES: readonly AgentStatus[] = ['working', 'break', 'lunch', 'offline'];

export const DEFAULT_STATUS: AgentStatus = 'working';

export const NAME_MAX_LENGTH = 50;

export interface StatusMeta {
  label: string;
  shortLabel: string;
  /** Clases Tailwind del badge (fondo, texto y borde). */
  badgeClass: string;
  /** Clase del punto indicador. */
  dotClass: string;
}

export const STATUS_META: Record<AgentStatus, StatusMeta> = {
  working: {
    label: 'Trabajando / disponible',
    shortLabel: 'Trabajando',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    dotClass: 'bg-emerald-600',
  },
  break: {
    label: 'En descanso',
    shortLabel: 'Descanso',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-600/25',
    dotClass: 'bg-amber-500',
  },
  lunch: {
    label: 'En almuerzo',
    shortLabel: 'Almuerzo',
    badgeClass: 'bg-orange-50 text-orange-800 ring-orange-600/20',
    dotClass: 'bg-orange-500',
  },
  offline: {
    label: 'Fuera de línea',
    shortLabel: 'Fuera de línea',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    dotClass: 'bg-slate-400',
  },
};

export const QUEUE_DESCRIPTIONS: Record<Queue, string> = {
  Audits: 'Revisión y auditoría de carriers',
  LoadRule: 'Reglas de carga y validaciones',
  Insurance: 'Seguros y certificados de carriers',
};

export function isQueue(value: unknown): value is Queue {
  return typeof value === 'string' && (QUEUES as readonly string[]).includes(value);
}

export function isAgentStatus(value: unknown): value is AgentStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}
