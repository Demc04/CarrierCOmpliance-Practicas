import { ShieldCheck } from 'lucide-react';
import type { ViewId } from '../../hooks/useHashView';
import { NAV_ITEMS } from './navigation';

interface SidebarProps {
  current: ViewId;
  onNavigate: (view: ViewId) => void;
  workingCount: number;
  total: number;
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
        <ShieldCheck aria-hidden="true" className="size-5 text-white" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">Carrier Compliance</p>
        <p className="text-xs text-navy-200">Disponibilidad de agentes</p>
      </div>
    </div>
  );
}

export function NavLinks({ current, onNavigate }: Pick<SidebarProps, 'current' | 'onNavigate'>) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = id === current;
        return (
          <li key={id}>
            <a
              href={`#/${id}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(id);
              }}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-white/70 ${
                active
                  ? 'bg-white/12 text-white ring-1 ring-white/10'
                  : 'text-navy-200 hover:bg-white/6 hover:text-white'
              }`}
            >
              <Icon aria-hidden="true" className="size-4.5 shrink-0" />
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ current, onNavigate, workingCount, total }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-900 px-4 py-5 lg:flex">
      <div className="px-2">
        <Brand />
      </div>
      <nav aria-label="Navegación principal" className="mt-8 flex-1">
        <NavLinks current={current} onNavigate={onNavigate} />
      </nav>
      <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
        <p className="text-xs font-medium text-navy-200">Disponibles ahora</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {workingCount} <span className="text-sm font-normal text-navy-200">de {total} agentes</span>
        </p>
        <p className="mt-2 text-[11px] leading-snug text-navy-200/80">
          Prototipo académico · Datos ficticios guardados solo en este navegador.
        </p>
      </div>
    </aside>
  );
}
