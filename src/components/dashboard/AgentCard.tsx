import { Clock, Pencil, Trash2 } from 'lucide-react';
import { formatDateTime, formatTime } from '../../lib/agents';
import type { Agent, AgentStatus } from '../../types/agent';
import { QueueTag } from '../ui/QueueTag';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusSelect } from '../ui/StatusSelect';

interface AgentCardProps {
  agent: Agent;
  onStatusChange: (agent: Agent, status: AgentStatus) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentCard({ agent, onStatusChange, onEdit, onDelete }: AgentCardProps) {
  return (
    <article className="card flex min-w-0 flex-col p-4" aria-label={`Agente ${agent.name}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900" title={agent.name}>
            {agent.name}
          </h3>
          <div className="mt-1.5">
            <QueueTag queue={agent.queue} />
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <Clock aria-hidden="true" className="size-3.5" />
        <span>
          Última actualización:{' '}
          <time dateTime={agent.updatedAt} title={formatDateTime(agent.updatedAt)}>
            {formatTime(agent.updatedAt)}
          </time>
        </span>
      </p>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <StatusSelect
          id={`status-${agent.id}`}
          label="Cambiar estado"
          value={agent.status}
          onChange={(status) => onStatusChange(agent, status)}
        />
        <div className="mt-3 flex justify-end gap-1">
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => onEdit(agent)}
            aria-label={`Editar ${agent.name}`}
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            Editar
          </button>
          <button
            type="button"
            className="btn-ghost text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => onDelete(agent)}
            aria-label={`Eliminar ${agent.name}`}
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
