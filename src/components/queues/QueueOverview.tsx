import { Inbox } from 'lucide-react';
import { useMemo } from 'react';
import { QUEUE_DESCRIPTIONS, STATUSES, STATUS_META } from '../../constants/agents';
import { formatDateTime, formatTime, summarizeByQueue } from '../../lib/agents';
import type { Agent, AgentStatus } from '../../types/agent';
import { PageHeader } from '../layout/PageHeader';
import { EmptyState } from '../ui/EmptyState';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusSelect } from '../ui/StatusSelect';

interface QueueOverviewProps {
  agents: Agent[];
  onStatusChange: (agent: Agent, status: AgentStatus) => void;
}

export function QueueOverview({ agents, onStatusChange }: QueueOverviewProps) {
  const summaries = useMemo(() => summarizeByQueue(agents), [agents]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organización"
        title="Vista por queue"
        description="Agentes agrupados por Audits, LoadRule e Insurance con su estado actual. Los cambios hechos aquí o en el panel general se reflejan en todas las vistas."
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {summaries.map(({ queue, agents: queueAgents, total, counts }) => (
          <section key={queue} className="card overflow-hidden" aria-labelledby={`queue-${queue}`}>
            <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id={`queue-${queue}`} className="text-base font-semibold text-slate-900">
                    {queue}
                  </h2>
                  <p className="text-xs text-slate-500">{QUEUE_DESCRIPTIONS[queue]}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold leading-none text-emerald-700 tabular-nums">
                    {counts.working}
                    <span className="text-sm font-medium text-slate-400"> / {total}</span>
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">disponibles / total</p>
                </div>
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                {STATUSES.map((status) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_META[status].dotClass}`} />
                    <dt>{STATUS_META[status].shortLabel}:</dt>
                    <dd className="font-semibold text-slate-800 tabular-nums">{counts[status]}</dd>
                  </div>
                ))}
              </dl>
            </header>

            <div className="p-3 sm:p-4">
              {queueAgents.length === 0 ? (
                <EmptyState
                  compact
                  icon={Inbox}
                  title="Sin agentes en esta queue"
                  description="Registra un agente y asígnale esta queue desde el panel general."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {queueAgents.map((agent) => (
                    <li
                      key={agent.id}
                      className="flex flex-col gap-2 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{agent.name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <StatusBadge status={agent.status} short />
                          <time dateTime={agent.updatedAt} title={formatDateTime(agent.updatedAt)}>
                            Act. {formatTime(agent.updatedAt)}
                          </time>
                        </p>
                      </div>
                      <div className="sm:w-48 sm:shrink-0">
                        <StatusSelect
                          compact
                          hideLabel
                          id={`queue-status-${agent.id}`}
                          label={`Cambiar estado de ${agent.name}`}
                          value={agent.status}
                          onChange={(status) => onStatusChange(agent, status)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
