import { CircleAlert, CircleCheck, CircleDashed, CircleMinus, Info, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { STATUSES, STATUS_META } from '../../constants/agents';
import { coverageLevel, summarizeByQueue, type CoverageLevel } from '../../lib/agents';
import type { Agent, AgentStatus } from '../../types/agent';
import { PageHeader } from '../layout/PageHeader';

interface TicketCoverageProps {
  agents: Agent[];
}

const LEVEL_STYLES: Record<CoverageLevel, { icon: LucideIcon; className: string }> = {
  multiple: { icon: CircleCheck, className: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20' },
  single: { icon: CircleMinus, className: 'bg-amber-50 text-amber-800 ring-amber-600/25' },
  none: { icon: CircleAlert, className: 'bg-red-50 text-red-800 ring-red-600/20' },
  empty: { icon: CircleDashed, className: 'bg-slate-100 text-slate-700 ring-slate-500/20' },
};

function levelLabel(level: CoverageLevel, working: number): string {
  switch (level) {
    case 'multiple':
      return `${working} agentes trabajando / disponibles`;
    case 'single':
      return '1 agente trabajando / disponible';
    case 'none':
      return 'Ningún agente trabajando / disponible';
    case 'empty':
      return 'Sin agentes registrados';
  }
}

const BAR_COLORS: Record<AgentStatus, string> = {
  working: 'bg-emerald-600',
  break: 'bg-amber-400',
  lunch: 'bg-orange-400',
  offline: 'bg-slate-300',
};

function NameList({ title, names, status }: { title: string; names: string[]; status: AgentStatus }) {
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_META[status].dotClass}`} />
        {title} <span className="font-normal text-slate-500">({names.length})</span>
      </h3>
      {names.length === 0 ? (
        <p className="mt-1.5 text-xs text-slate-400">Ninguno</p>
      ) : (
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {names.map((name) => (
            <li key={name} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Sección demostrativa. Solo describe la distribución de estados por queue;
 * no asigna tickets, no se conecta a Jira y no aplica reglas de capacidad.
 */
export function TicketCoverage({ agents }: TicketCoverageProps) {
  const summaries = useMemo(() => summarizeByQueue(agents), [agents]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Referencia visual"
        title="Cobertura de tickets"
        description="Visualiza qué agentes figuran como trabajando / disponibles en cada queue mientras otros están en descanso o almuerzo, para apoyar la coordinación del equipo."
      />

      <div className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-600" />
        <p>
          Esta sección es <strong className="font-semibold">solo una referencia visual</strong>. No
          asigna tickets, no se conecta a Jira y no indica que un agente pueda atender cualquier
          ticket por figurar como disponible. Las decisiones de cobertura siguen el criterio del
          equipo y de su líder.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {summaries.map((summary) => {
          const level = coverageLevel(summary);
          const style = LEVEL_STYLES[level];
          const LevelIcon = style.icon;
          const namesBy = (status: AgentStatus) =>
            summary.agents.filter((agent) => agent.status === status).map((agent) => agent.name);
          return (
            <section key={summary.queue} className="card flex flex-col p-4 sm:p-5" aria-labelledby={`cov-${summary.queue}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 id={`cov-${summary.queue}`} className="text-base font-semibold text-slate-900">
                  {summary.queue}
                </h2>
                <span className="text-xs text-slate-500">
                  {summary.total} {summary.total === 1 ? 'agente' : 'agentes'}
                </span>
              </div>

              <p
                className={`mt-3 inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.className}`}
              >
                <LevelIcon aria-hidden="true" className="size-3.5" />
                {levelLabel(level, summary.counts.working)}
              </p>

              <div
                className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-100"
                role="img"
                aria-label={`Distribución de estados en ${summary.queue}: ${STATUSES.map(
                  (status) => `${summary.counts[status]} ${STATUS_META[status].label.toLowerCase()}`,
                ).join(', ')}`}
              >
                {summary.total > 0 &&
                  STATUSES.map((status) =>
                    summary.counts[status] > 0 ? (
                      <span
                        key={status}
                        className={BAR_COLORS[status]}
                        style={{ width: `${(summary.counts[status] / summary.total) * 100}%` }}
                      />
                    ) : null,
                  )}
              </div>

              <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                <NameList title="Trabajando / disponibles" status="working" names={namesBy('working')} />
                <NameList title="En descanso" status="break" names={namesBy('break')} />
                <NameList title="En almuerzo" status="lunch" names={namesBy('lunch')} />
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Fuera de línea: <span className="font-semibold text-slate-700">{summary.counts.offline}</span>
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
