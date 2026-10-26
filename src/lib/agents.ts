import { NAME_MAX_LENGTH, QUEUES, STATUSES } from '../constants/agents';
import type { Agent, AgentFilters, Queue, StatusCounts } from '../types/agent';

/** Normaliza un nombre: recorta extremos y colapsa espacios internos. */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/** Compara nombres ignorando mayúsculas, minúsculas y espacios sobrantes. */
export function sameName(a: string, b: string): boolean {
  return normalizeName(a).toLocaleLowerCase('es') === normalizeName(b).toLocaleLowerCase('es');
}

/**
 * Valida el nombre de un agente. Devuelve un mensaje de error o null si es válido.
 * `excludeId` permite ignorar al propio agente al editar su nombre.
 */
export function validateAgentName(
  rawName: string,
  agents: readonly Agent[],
  excludeId?: string,
): string | null {
  const name = normalizeName(rawName);
  if (!name) return 'El nombre del agente es obligatorio.';
  if (name.length > NAME_MAX_LENGTH) {
    return `El nombre no puede superar ${NAME_MAX_LENGTH} caracteres.`;
  }
  const duplicate = agents.some((agent) => agent.id !== excludeId && sameName(agent.name, name));
  if (duplicate) return `Ya existe un agente llamado “${name}”. Usa un nombre diferente.`;
  return null;
}

export function filterAgents(agents: readonly Agent[], filters: AgentFilters): Agent[] {
  return agents.filter(
    (agent) =>
      (filters.queue === 'all' || agent.queue === filters.queue) &&
      (filters.status === 'all' || agent.status === filters.status),
  );
}

export function emptyCounts(): StatusCounts {
  return { working: 0, break: 0, lunch: 0, offline: 0 };
}

export function countByStatus(agents: readonly Agent[]): StatusCounts {
  const counts = emptyCounts();
  for (const agent of agents) counts[agent.status] += 1;
  return counts;
}

export interface QueueSummary {
  queue: Queue;
  agents: Agent[];
  total: number;
  counts: StatusCounts;
}

/** Agrupa los agentes por queue, manteniendo siempre las tres queues. */
export function summarizeByQueue(agents: readonly Agent[]): QueueSummary[] {
  return QUEUES.map((queue) => {
    const queueAgents = sortAgents(agents.filter((agent) => agent.queue === queue));
    return {
      queue,
      agents: queueAgents,
      total: queueAgents.length,
      counts: countByStatus(queueAgents),
    };
  });
}

/** Ordena por estado (disponibles primero) y luego por nombre. */
export function sortAgents(agents: readonly Agent[]): Agent[] {
  return [...agents].sort(
    (a, b) =>
      STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) ||
      a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' }),
  );
}

/**
 * Nivel visual de disponibilidad de una queue. Es solo una referencia descriptiva
 * basada en cuántos agentes figuran como trabajando / disponibles; no representa
 * capacidad real ni reglas de asignación de tickets.
 */
export type CoverageLevel = 'none' | 'single' | 'multiple' | 'empty';

export function coverageLevel(summary: QueueSummary): CoverageLevel {
  if (summary.total === 0) return 'empty';
  if (summary.counts.working === 0) return 'none';
  if (summary.counts.working === 1) return 'single';
  return 'multiple';
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Hora no disponible';
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
