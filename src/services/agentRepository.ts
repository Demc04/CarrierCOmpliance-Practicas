import type { Agent } from '../types/agent';

/**
 * Contrato de persistencia de agentes.
 *
 * La interfaz de usuario solo depende de este contrato, de modo que una versión
 * futura pueda sustituir la implementación local por un backend compartido
 * (por ejemplo, una API autenticada) sin modificar los componentes.
 * Los métodos son asíncronos por ese mismo motivo.
 */
export interface AgentRepository {
  /** Devuelve los agentes guardados o el equipo de ejemplo si no hay datos válidos. */
  load(): Promise<LoadResult>;
  /** Guarda la lista completa de agentes. */
  save(agents: readonly Agent[]): Promise<void>;
  /** Restaura el equipo de ejemplo y lo devuelve. */
  reset(): Promise<Agent[]>;
}

export interface LoadResult {
  agents: Agent[];
  /** Origen de los datos cargados, útil para informar al usuario. */
  source: 'stored' | 'demo' | 'recovered';
}
