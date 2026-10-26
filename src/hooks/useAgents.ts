import { useCallback, useEffect, useRef, useState } from 'react';
import { createId, normalizeName, validateAgentName } from '../lib/agents';
import type { AgentRepository, LoadResult } from '../services/agentRepository';
import type { Agent, AgentUpdate, NewAgentInput } from '../types/agent';

export type ActionResult<T = void> = { ok: true; value: T } | { ok: false; error: string };

export interface UseAgentsResult {
  agents: Agent[];
  loading: boolean;
  loadSource: LoadResult['source'] | null;
  /** Último error de persistencia (los cambios siguen en memoria). */
  storageError: string | null;
  addAgent(input: NewAgentInput): Promise<ActionResult<Agent>>;
  updateAgent(id: string, changes: AgentUpdate): Promise<ActionResult<Agent>>;
  removeAgent(id: string): Promise<ActionResult<Agent>>;
  resetDemo(): Promise<ActionResult>;
}

/**
 * Estado de agentes de la aplicación. Toda la persistencia pasa por el
 * `AgentRepository` recibido, por lo que los componentes no conocen localStorage.
 */
export function useAgents(repository: AgentRepository): UseAgentsResult {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadSource, setLoadSource] = useState<LoadResult['source'] | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  // Referencia siempre actualizada para validar sin depender del ciclo de render.
  const agentsRef = useRef<Agent[]>([]);

  useEffect(() => {
    let cancelled = false;
    repository
      .load()
      .then((result) => {
        if (cancelled) return;
        agentsRef.current = result.agents;
        setAgents(result.agents);
        setLoadSource(result.source);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStorageError(error instanceof Error ? error.message : 'No se pudieron cargar los datos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const commit = useCallback(
    async (next: Agent[]) => {
      agentsRef.current = next;
      setAgents(next);
      try {
        await repository.save(next);
        setStorageError(null);
      } catch (error) {
        setStorageError(
          error instanceof Error ? error.message : 'No se pudieron guardar los cambios.',
        );
      }
    },
    [repository],
  );

  const addAgent = useCallback<UseAgentsResult['addAgent']>(
    async (input) => {
      const error = validateAgentName(input.name, agentsRef.current);
      if (error) return { ok: false, error };
      const agent: Agent = {
        id: createId(),
        name: normalizeName(input.name),
        queue: input.queue,
        status: input.status,
        updatedAt: new Date().toISOString(),
      };
      await commit([...agentsRef.current, agent]);
      return { ok: true, value: agent };
    },
    [commit],
  );

  const updateAgent = useCallback<UseAgentsResult['updateAgent']>(
    async (id, changes) => {
      const current = agentsRef.current.find((agent) => agent.id === id);
      if (!current) return { ok: false, error: 'El agente ya no existe.' };
      if (changes.name !== undefined) {
        const error = validateAgentName(changes.name, agentsRef.current, id);
        if (error) return { ok: false, error };
      }
      const updated: Agent = {
        ...current,
        ...changes,
        name: changes.name !== undefined ? normalizeName(changes.name) : current.name,
        updatedAt: new Date().toISOString(),
      };
      await commit(agentsRef.current.map((agent) => (agent.id === id ? updated : agent)));
      return { ok: true, value: updated };
    },
    [commit],
  );

  const removeAgent = useCallback<UseAgentsResult['removeAgent']>(
    async (id) => {
      const current = agentsRef.current.find((agent) => agent.id === id);
      if (!current) return { ok: false, error: 'El agente ya no existe.' };
      await commit(agentsRef.current.filter((agent) => agent.id !== id));
      return { ok: true, value: current };
    },
    [commit],
  );

  const resetDemo = useCallback<UseAgentsResult['resetDemo']>(async () => {
    try {
      const demo = await repository.reset();
      agentsRef.current = demo;
      setAgents(demo);
      setStorageError(null);
      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudieron restaurar los datos.',
      };
    }
  }, [repository]);

  return { agents, loading, loadSource, storageError, addAgent, updateAgent, removeAgent, resetDemo };
}
