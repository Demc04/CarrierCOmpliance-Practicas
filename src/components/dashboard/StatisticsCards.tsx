import { Coffee, Power, UserCheck, Users, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { STATUS_META } from '../../constants/agents';
import type { AgentStatus, StatusCounts, StatusFilterValue } from '../../types/agent';

interface StatisticsCardsProps {
  total: number;
  counts: StatusCounts;
  activeStatus: StatusFilterValue;
  onSelectStatus: (status: StatusFilterValue) => void;
}

interface CardDefinition {
  key: StatusFilterValue;
  label: string;
  icon: LucideIcon;
  iconClass: string;
}

const CARDS: readonly CardDefinition[] = [
  { key: 'all', label: 'Agentes registrados', icon: Users, iconClass: 'bg-navy-100 text-navy-800' },
  { key: 'working', label: STATUS_META.working.label, icon: UserCheck, iconClass: 'bg-emerald-50 text-emerald-700' },
  { key: 'break', label: STATUS_META.break.label, icon: Coffee, iconClass: 'bg-amber-50 text-amber-700' },
  { key: 'lunch', label: STATUS_META.lunch.label, icon: UtensilsCrossed, iconClass: 'bg-orange-50 text-orange-700' },
  { key: 'offline', label: STATUS_META.offline.label, icon: Power, iconClass: 'bg-slate-100 text-slate-600' },
];

/** Tarjetas de resumen. Al pulsarlas se aplica el filtro de estado correspondiente. */
export function StatisticsCards({ total, counts, activeStatus, onSelectStatus }: StatisticsCardsProps) {
  return (
    <section aria-labelledby="stats-title">
      <h2 id="stats-title" className="sr-only">
        Resumen de disponibilidad
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {CARDS.map(({ key, label, icon: Icon, iconClass }) => {
          const value = key === 'all' ? total : counts[key as AgentStatus];
          const pressed = activeStatus === key;
          return (
            <li key={key} className={key === 'all' ? 'col-span-2 md:col-span-1' : undefined}>
              <button
                type="button"
                onClick={() => onSelectStatus(pressed && key !== 'all' ? 'all' : key)}
                aria-pressed={pressed}
                title={key === 'all' ? 'Mostrar todos los estados' : `Filtrar: ${label}`}
                className={`card flex h-full w-full cursor-pointer items-center gap-3 p-4 text-left transition-colors hover:border-slate-300 ${
                  pressed ? 'border-brand-600 ring-1 ring-brand-600' : ''
                }`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${iconClass}`}>
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-2xl font-semibold leading-none text-slate-900 tabular-nums">
                    {value}
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-snug text-slate-500">{label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
