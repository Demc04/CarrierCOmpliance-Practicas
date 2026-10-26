import { SearchX, Users } from 'lucide-react';
import type { Agent, AgentStatus } from '../../types/agent';
import { EmptyState } from '../ui/EmptyState';
import { AgentCard } from './AgentCard';

interface AgentListProps {
  agents: Agent[];
  totalAgents: number;
  onClearFilters: () => void;
  onStatusChange: (agent: Agent, status: AgentStatus) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentList({ agents, totalAgents, onClearFilters, ...actions }: AgentListProps) {
  if (totalAgents === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Todavía no hay agentes registrados"
        description="Agrega un agente con el formulario o restaura el equipo de ejemplo desde “Datos de la demo”."
      />
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No hay agentes que coincidan con los filtros"
        description="Prueba con otra combinación de queue y estado."
        action={
          <button type="button" className="btn-secondary" onClick={onClearFilters}>
            Limpiar filtros
          </button>
        }
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
      {agents.map((agent) => (
        <li key={agent.id} className="flex">
          <div className="w-full">
            <AgentCard agent={agent} {...actions} />
          </div>
        </li>
      ))}
    </ul>
  );
}
