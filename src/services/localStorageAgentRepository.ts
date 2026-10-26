import { isAgentStatus, isQueue, NAME_MAX_LENGTH } from '../constants/agents';
import { createDemoAgents } from '../data/demoAgents';
import { normalizeName, sameName } from '../lib/agents';
import type { Agent } from '../types/agent';
import type { AgentRepository, LoadResult } from './agentRepository';

export const STORAGE_KEY = 'carrierCompliance.agentAvailability.v1';

interface StoredPayload {
  version: 1;
  agents: Agent[];
}

/** Obtiene localStorage de forma segura (puede no existir o estar bloqueado). */
function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Convierte un valor desconocido en un agente válido, o null si no se puede.
 * Los registros incompletos o con valores fuera de catálogo se descartan.
 */
function sanitizeAgent(value: unknown): Agent | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || !record.id) return null;
  if (typeof record.name !== 'string') return null;
  const name = normalizeName(record.name);
  if (!name || name.length > NAME_MAX_LENGTH) return null;
  if (!isQueue(record.queue) || !isAgentStatus(record.status)) return null;
  const updatedAt =
    typeof record.updatedAt === 'string' && !Number.isNaN(Date.parse(record.updatedAt))
      ? record.updatedAt
      : new Date().toISOString();
  return { id: record.id, name, queue: record.queue, status: record.status, updatedAt };
}

/** Analiza el contenido guardado. Devuelve null si está corrupto por completo. */
export function parseStoredAgents(raw: string): { agents: Agent[]; dropped: number } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const list = (parsed as Partial<StoredPayload>).agents;
  if (!Array.isArray(list)) return null;

  const agents: Agent[] = [];
  for (const item of list) {
    const agent = sanitizeAgent(item);
    // Se descartan ids o nombres repetidos para mantener la integridad.
    if (
      agent &&
      !agents.some((existing) => existing.id === agent.id || sameName(existing.name, agent.name))
    ) {
      agents.push(agent);
    }
  }
  return { agents, dropped: list.length - agents.length };
}

export class LocalStorageAgentRepository implements AgentRepository {
  constructor(private readonly key: string = STORAGE_KEY) {}

  async load(): Promise<LoadResult> {
    const storage = getStorage();
    let raw: string | null = null;
    try {
      raw = storage?.getItem(this.key) ?? null;
    } catch {
      raw = null;
    }

    if (raw === null) {
      const agents = createDemoAgents();
      await this.save(agents);
      return { agents, source: 'demo' };
    }

    const result = parseStoredAgents(raw);
    if (!result) {
      const agents = createDemoAgents();
      await this.save(agents);
      return { agents, source: 'recovered' };
    }

    if (result.dropped > 0) await this.save(result.agents);
    return { agents: result.agents, source: result.dropped > 0 ? 'recovered' : 'stored' };
  }

  async save(agents: readonly Agent[]): Promise<void> {
    const storage = getStorage();
    if (!storage) throw new Error('El almacenamiento local no está disponible en este navegador.');
    const payload: StoredPayload = { version: 1, agents: [...agents] };
    try {
      storage.setItem(this.key, JSON.stringify(payload));
    } catch {
      throw new Error('No se pudieron guardar los cambios en el almacenamiento local.');
    }
  }

  async reset(): Promise<Agent[]> {
    const agents = createDemoAgents();
    await this.save(agents);
    return agents;
  }
}
