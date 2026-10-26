/** Queues de trabajo del equipo de Carrier Compliance. */
export type Queue = 'Audits' | 'LoadRule' | 'Insurance';

/** Estados de disponibilidad que puede tener un agente. */
export type AgentStatus = 'working' | 'break' | 'lunch' | 'offline';

export interface Agent {
  id: string;
  name: string;
  queue: Queue;
  status: AgentStatus;
  /** Fecha ISO 8601 de la última modificación del agente. */
  updatedAt: string;
}

/** Datos necesarios para crear un agente (el id y la fecha se generan). */
export interface NewAgentInput {
  name: string;
  queue: Queue;
  status: AgentStatus;
}

/** Campos editables de un agente existente. */
export type AgentUpdate = Partial<Pick<Agent, 'name' | 'queue' | 'status'>>;

export type QueueFilterValue = Queue | 'all';
export type StatusFilterValue = AgentStatus | 'all';

export interface AgentFilters {
  queue: QueueFilterValue;
  status: StatusFilterValue;
}

export type StatusCounts = Record<AgentStatus, number>;
