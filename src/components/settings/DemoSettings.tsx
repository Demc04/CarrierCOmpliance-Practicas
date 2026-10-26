import { Database, HardDrive, RotateCcw, ShieldOff } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';

interface DemoSettingsProps {
  agentCount: number;
  onRequestReset: () => void;
}

const LIMITATIONS = [
  'Los datos se guardan solo en este navegador (localStorage) y no se comparten con otras personas ni dispositivos.',
  'No existe inicio de sesión: cualquiera con acceso a este navegador puede modificar los estados.',
  'No hay integración con Jira, Slack ni sistemas de Lean Solutions Group.',
  'No registra tiempos oficiales, asistencia ni asigna tickets.',
];

export function DemoSettings({ agentCount, onRequestReset }: DemoSettingsProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Datos de la demo"
        description="Administra los datos ficticios del prototipo y revisa el alcance de esta versión."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="reset-title">
          <div className="flex items-center gap-2">
            <RotateCcw aria-hidden="true" className="size-5 text-brand-600" />
            <h2 id="reset-title" className="text-base font-semibold text-slate-900">
              Restaurar equipo de ejemplo
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Reemplaza los {agentCount} {agentCount === 1 ? 'agente actual' : 'agentes actuales'} por
            el equipo ficticio inicial de nueve agentes distribuidos entre Audits, LoadRule e
            Insurance. Esta acción no se puede deshacer.
          </p>
          <button type="button" className="btn-secondary mt-4" onClick={onRequestReset}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Restaurar datos de ejemplo
          </button>
        </section>

        <section className="card p-5" aria-labelledby="storage-title">
          <div className="flex items-center gap-2">
            <HardDrive aria-hidden="true" className="size-5 text-brand-600" />
            <h2 id="storage-title" className="text-base font-semibold text-slate-900">
              Almacenamiento local
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Cada cambio se guarda automáticamente en el almacenamiento local del navegador y se
            conserva al recargar la página. Si los datos guardados están dañados, la aplicación
            descarta los registros inválidos o vuelve a cargar el equipo de ejemplo.
          </p>
        </section>

        <section className="card p-5 lg:col-span-2" aria-labelledby="limits-title">
          <div className="flex items-center gap-2">
            <ShieldOff aria-hidden="true" className="size-5 text-brand-600" />
            <h2 id="limits-title" className="text-base font-semibold text-slate-900">
              Alcance y limitaciones del prototipo
            </h2>
          </div>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            {LIMITATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 ring-1 ring-slate-200">
            <Database aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <p>
              Una versión multiusuario requeriría un backend compartido con autenticación y
              autorización corporativa, aprobado por la empresa. El código separa la persistencia
              en un repositorio intercambiable para facilitar esa migración.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
