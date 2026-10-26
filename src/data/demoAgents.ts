import type { Agent, AgentStatus, Queue } from '../types/agent';

/**
 * Equipo de demostración con nombres ficticios.
 * No representa personas reales ni datos de Lean Solutions Group.
 */
const DEMO_TEAM: ReadonlyArray<{ name: string; queue: Queue; status: AgentStatus }> = [
  { name: 'Agente 01', queue: 'Audits', status: 'working' },
  { name: 'Agente 02', queue: 'Audits', status: 'lunch' },
  { name: 'Agente 03', queue: 'Audits', status: 'working' },
  { name: 'Agente 04', queue: 'LoadRule', status: 'break' },
  { name: 'Agente 05', queue: 'LoadRule', status: 'working' },
  { name: 'Agente 06', queue: 'LoadRule', status: 'offline' },
  { name: 'Agente 07', queue: 'Insurance', status: 'working' },
  { name: 'Agente 08', queue: 'Insurance', status: 'working' },
  { name: 'Agente 09', queue: 'Insurance', status: 'lunch' },
];

/** Genera una copia nueva del equipo de ejemplo con la hora actual. */
export function createDemoAgents(now: Date = new Date()): Agent[] {
  const timestamp = now.toISOString();
  return DEMO_TEAM.map((agent, index) => ({
    id: `demo-${String(index + 1).padStart(2, '0')}`,
    ...agent,
    updatedAt: timestamp,
  }));
}
