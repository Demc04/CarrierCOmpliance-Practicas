import { describe, expect, it } from 'vitest';
import { createDemoAgents } from '../data/demoAgents';
import type { Agent } from '../types/agent';
import { countByStatus, coverageLevel, filterAgents, summarizeByQueue, validateAgentName } from './agents';

const agents: Agent[] = createDemoAgents(new Date('2026-01-01T12:00:00Z'));

describe('validateAgentName', () => {
  it('rechaza nombres vacíos o solo con espacios', () => {
    expect(validateAgentName('', agents)).toMatch(/obligatorio/);
    expect(validateAgentName('   ', agents)).toMatch(/obligatorio/);
  });

  it('rechaza duplicados ignorando mayúsculas y espacios', () => {
    expect(validateAgentName('agente 01', agents)).toMatch(/Ya existe/);
    expect(validateAgentName('  AGENTE   01 ', agents)).toMatch(/Ya existe/);
  });

  it('permite conservar el propio nombre al editar', () => {
    expect(validateAgentName('agente 01', agents, agents[0].id)).toBeNull();
  });

  it('acepta un nombre nuevo', () => {
    expect(validateAgentName('Agente 99', agents)).toBeNull();
  });
});

describe('filterAgents', () => {
  it('combina filtros de queue y estado', () => {
    const result = filterAgents(agents, { queue: 'Insurance', status: 'working' });
    expect(result.map((a) => a.name)).toEqual(['Agente 07', 'Agente 08']);
  });

  it('aplica filtros individuales', () => {
    expect(filterAgents(agents, { queue: 'Audits', status: 'all' })).toHaveLength(3);
    expect(filterAgents(agents, { queue: 'all', status: 'lunch' })).toHaveLength(2);
    expect(filterAgents(agents, { queue: 'all', status: 'all' })).toHaveLength(agents.length);
  });
});

describe('resúmenes', () => {
  it('cuenta agentes por estado', () => {
    expect(countByStatus(agents)).toEqual({ working: 5, break: 1, lunch: 2, offline: 1 });
  });

  it('agrupa por queue y calcula el indicador visual', () => {
    const summaries = summarizeByQueue(agents);
    expect(summaries.map((s) => [s.queue, s.total, s.counts.working])).toEqual([
      ['Audits', 3, 2],
      ['LoadRule', 3, 1],
      ['Insurance', 3, 2],
    ]);
    expect(coverageLevel(summaries[0])).toBe('multiple');
    expect(coverageLevel(summaries[1])).toBe('single');
    expect(coverageLevel(summarizeByQueue([])[0])).toBe('empty');
    const noneWorking = summarizeByQueue(agents.map((a) => ({ ...a, status: 'break' as const })));
    expect(coverageLevel(noneWorking[0])).toBe('none');
  });
});
