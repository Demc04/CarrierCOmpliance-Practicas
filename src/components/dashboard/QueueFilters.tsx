import { FilterX, SlidersHorizontal } from 'lucide-react';
import { QUEUES, STATUSES, STATUS_META, isAgentStatus, isQueue } from '../../constants/agents';
import type { AgentFilters } from '../../types/agent';

interface QueueFiltersProps {
  filters: AgentFilters;
  onChange: (filters: AgentFilters) => void;
  shown: number;
  total: number;
}

export function QueueFilters({ filters, onChange, shown, total }: QueueFiltersProps) {
  const active = filters.queue !== 'all' || filters.status !== 'all';
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:flex-wrap sm:items-end">
      <span className="hidden items-center gap-2 self-center text-sm font-semibold text-slate-700 sm:flex">
        <SlidersHorizontal aria-hidden="true" className="size-4 text-slate-500" />
        Filtros
      </span>
      <div className="sm:w-48">
        <label htmlFor="filter-queue" className="field-label text-xs">
          Queue
        </label>
        <select
          id="filter-queue"
          className="field-input py-2"
          value={filters.queue}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ ...filters, queue: isQueue(value) ? value : 'all' });
          }}
        >
          <option value="all">Todas las queues</option>
          {QUEUES.map((queue) => (
            <option key={queue} value={queue}>
              {queue}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:w-56">
        <label htmlFor="filter-status" className="field-label text-xs">
          Estado
        </label>
        <select
          id="filter-status"
          className="field-input py-2"
          value={filters.status}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ ...filters, status: isAgentStatus(value) ? value : 'all' });
          }}
        >
          <option value="all">Todos los estados</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="btn-secondary py-2"
        onClick={() => onChange({ queue: 'all', status: 'all' })}
        disabled={!active}
      >
        <FilterX aria-hidden="true" className="size-4" />
        Limpiar filtros
      </button>
      <p className="text-xs text-slate-500 sm:ml-auto sm:self-center" aria-live="polite">
        Mostrando <strong className="font-semibold text-slate-700">{shown}</strong> de {total}{' '}
        {total === 1 ? 'agente' : 'agentes'}
      </p>
    </div>
  );
}
