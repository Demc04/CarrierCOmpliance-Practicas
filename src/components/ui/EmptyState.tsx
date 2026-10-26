import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center ${
        compact ? 'px-4 py-6' : 'px-6 py-12'
      }`}
    >
      <span className="mb-3 grid size-10 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
