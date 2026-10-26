import { useMemo } from 'react';
import { countByStatus, filterAgents, sortAgents } from '../../lib/agents';
import type { Agent, AgentFilters, AgentStatus, NewAgentInput } from '../../types/agent';
import { DemoNotice } from '../layout/DemoNotice';
import { PageHeader } from '../layout/PageHeader';
import { AgentForm } from './AgentForm';
import { AgentList } from './AgentList';
import { QueueFilters } from './QueueFilters';
import { StatisticsCards } from './StatisticsCards';

interface DashboardProps {
  agents: Agent[];
  filters: AgentFilters;
  onFiltersChange: (filters: AgentFilters) => void;
  onAddAgent: (input: NewAgentInput) => Promise<string | null>;
  onStatusChange: (agent: Agent, status: AgentStatus) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function Dashboard({
  agents,
  filters,
  onFiltersChange,
  onAddAgent,
  onStatusChange,
  onEdit,
  onDelete,
}: DashboardProps) {
  const counts = useMemo(() => countByStatus(agents), [agents]);
  const visible = useMemo(() => sortAgents(filterAgents(agents, filters)), [agents, filters]);
  const clearFilters = () => onFiltersChange({ queue: 'all', status: 'all' });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Carrier Compliance · Legal"
        title="Panel de disponibilidad de agentes"
        description="Consulta en un solo lugar quién está trabajando, en descanso, en almuerzo o fuera de línea en las queues Audits, LoadRule e Insurance, como alternativa a los avisos dispersos en Slack."
      />
      <DemoNotice />

      <StatisticsCards
        total={agents.length}
        counts={counts}
        activeStatus={filters.status}
        onSelectStatus={(status) => onFiltersChange({ ...filters, status })}
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-6">
          <AgentForm onSubmit={onAddAgent} />
        </div>

        <section className="card p-4 sm:p-5" aria-labelledby="team-title">
          <h2 id="team-title" className="text-base font-semibold text-slate-900">
            Estado del equipo
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Cambia el estado desde cada tarjeta; el resumen y las demás vistas se actualizan al
            instante.
          </p>
          <div className="mt-4">
            <QueueFilters
              filters={filters}
              onChange={onFiltersChange}
              shown={visible.length}
              total={agents.length}
            />
          </div>
          <div className="mt-4">
            <AgentList
              agents={visible}
              totalAgents={agents.length}
              onClearFilters={clearFilters}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
