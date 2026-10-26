import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageAgentRepository, STORAGE_KEY } from './localStorageAgentRepository';

describe('LocalStorageAgentRepository', () => {
  let repo: LocalStorageAgentRepository;
  beforeEach(() => {
    localStorage.clear();
    repo = new LocalStorageAgentRepository();
  });

  it('inicializa con datos de ejemplo cuando no hay nada guardado', async () => {
    const result = await repo.load();
    expect(result.source).toBe('demo');
    expect(result.agents).toHaveLength(9);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('guarda y vuelve a cargar los agentes', async () => {
    const { agents } = await repo.load();
    await repo.save(agents.slice(0, 2));
    const reloaded = await new LocalStorageAgentRepository().load();
    expect(reloaded.source).toBe('stored');
    expect(reloaded.agents.map((a) => a.name)).toEqual(['Agente 01', 'Agente 02']);
  });

  it('recupera el equipo de ejemplo si el JSON está corrupto', async () => {
    localStorage.setItem(STORAGE_KEY, '{no es json');
    const result = await repo.load();
    expect(result.source).toBe('recovered');
    expect(result.agents).toHaveLength(9);
  });

  it('recupera el equipo de ejemplo si la estructura no es válida', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 1 }));
    expect((await repo.load()).agents).toHaveLength(9);
  });

  it('descarta registros inválidos o duplicados y conserva los válidos', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        agents: [
          { id: '1', name: 'Válido', queue: 'Audits', status: 'working', updatedAt: '2026-01-01T00:00:00Z' },
          { id: '2', name: 'válido', queue: 'Audits', status: 'working', updatedAt: '2026-01-01T00:00:00Z' },
          { id: '3', name: 'Sin queue', status: 'working' },
          { id: '4', name: 'Estado raro', queue: 'Insurance', status: 'vacaciones' },
          { id: '5', name: '   ', queue: 'Insurance', status: 'break' },
          null,
          { id: '6', name: 'Sin fecha', queue: 'LoadRule', status: 'lunch', updatedAt: 'xx' },
        ],
      }),
    );
    const result = await repo.load();
    expect(result.source).toBe('recovered');
    expect(result.agents.map((a) => a.name)).toEqual(['Válido', 'Sin fecha']);
    expect(Number.isNaN(Date.parse(result.agents[1].updatedAt))).toBe(false);
  });

  it('una lista vacía guardada se respeta (no se rellena con ejemplos)', async () => {
    await repo.save([]);
    const result = await repo.load();
    expect(result.source).toBe('stored');
    expect(result.agents).toHaveLength(0);
  });

  it('reset restaura los datos de ejemplo', async () => {
    await repo.save([]);
    const agents = await repo.reset();
    expect(agents).toHaveLength(9);
    expect((await repo.load()).agents).toHaveLength(9);
  });
});
