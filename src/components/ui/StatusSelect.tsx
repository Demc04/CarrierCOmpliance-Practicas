import { STATUSES, STATUS_META, isAgentStatus } from '../../constants/agents';
import type { AgentStatus } from '../../types/agent';

interface StatusSelectProps {
  id: string;
  value: AgentStatus;
  onChange: (status: AgentStatus) => void;
  /** Etiqueta accesible; se lee junto con el nombre del agente. */
  label: string;
  hideLabel?: boolean;
  compact?: boolean;
}

export function StatusSelect({ id, value, onChange, label, hideLabel = false, compact = false }: StatusSelectProps) {
  return (
    <div>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'field-label text-xs'}>
        {label}
      </label>
      <select
        id={id}
        className={`field-input ${compact ? 'py-1.5 text-xs' : 'py-2'}`}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (isAgentStatus(next) && next !== value) onChange(next);
        }}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_META[status].label}
          </option>
        ))}
      </select>
    </div>
  );
}
