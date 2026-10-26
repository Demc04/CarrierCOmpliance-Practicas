import { STATUS_META } from '../../constants/agents';
import type { AgentStatus } from '../../types/agent';

interface StatusBadgeProps {
  status: AgentStatus;
  short?: boolean;
}

export function StatusBadge({ status, short = false }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.badgeClass}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${meta.dotClass}`} />
      {short ? meta.shortLabel : meta.label}
    </span>
  );
}
