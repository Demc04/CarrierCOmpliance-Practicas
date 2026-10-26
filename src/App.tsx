import { Loader2, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TicketCoverage } from './components/coverage/TicketCoverage';
import { Dashboard } from './components/dashboard/Dashboard';
import { EditAgentDialog } from './components/dashboard/EditAgentDialog';
import { MobileNav } from './components/layout/MobileNav';
import { Sidebar } from './components/layout/Sidebar';
import { QueueOverview } from './components/queues/QueueOverview';
import { DemoSettings } from './components/settings/DemoSettings';
import { ConfirmationDialog } from './components/ui/ConfirmationDialog';
import { ToastProvider, useToast } from './components/ui/Toast';
import { STATUS_META } from './constants/agents';
import { useAgents } from './hooks/useAgents';
import { useHashView } from './hooks/useHashView';
import { filterAgents, normalizeName } from './lib/agents';
import type { AgentRepository } from './services/agentRepository';
import { LocalStorageAgentRepository } from './services/localStorageAgentRepository';
import type { Agent, AgentFilters, AgentStatus, AgentUpdate, NewAgentInput } from './types/agent';

const defaultRepository = new LocalStorageAgentRepository();

interface AppProps {
  /** Permite inyectar otra fuente de datos (pruebas o un backend futuro). */
  repository?: AgentRepository;
}

export default function App({ repository = defaultRepository }: AppProps) {
  return (
    <ToastProvider>
      <AvailabilityApp repository={repository} />
    </ToastProvider>
  );
}

function AvailabilityApp({ repository }: { repository: AgentRepository }) {
  const { agents, loading, loadSource, storageError, addAgent, updateAgent, removeAgent, resetDemo } =
    useAgents(repository);
  const { notify } = useToast();
  const [view, navigate] = useHashView();
  const [filters, setFilters] = useState<AgentFilters>({ queue: 'all', status: 'all' });
  const [editing, setEditing] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState<Agent | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (loadSource === 'recovered') {
      notify('info', 'Se encontraron datos guardados dañados; se recuperó la información válida.');
    }
  }, [loadSource, notify]);

  useEffect(() => {
    if (storageError) notify('error', `${storageError} Los cambios solo se conservan en esta sesión.`);
  }, [storageError, notify]);

  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [view]);

  const workingCount = useMemo(() => agents.filter((agent) => agent.status === 'working').length, [agents]);

  const handleAdd = useCallback(
    async (input: NewAgentInput): Promise<string | null> => {
      const result = await addAgent(input);
      if (!result.ok) return result.error;
      const hidden = filterAgents([result.value], filters).length === 0;
      notify(
        'success',
        hidden
          ? `${result.value.name} se registró en ${result.value.queue}. No aparece en la lista por los filtros activos.`
          : `${result.value.name} se registró en ${result.value.queue}.`,
      );
      return null;
    },
    [addAgent, filters, notify],
  );

  const handleStatusChange = useCallback(
    async (agent: Agent, status: AgentStatus) => {
      const result = await updateAgent(agent.id, { status });
      if (result.ok) notify('success', `${agent.name}: ${STATUS_META[status].label}.`);
      else notify('error', result.error);
    },
    [updateAgent, notify],
  );

  const handleSaveEdit = useCallback(
    async (id: string, changes: AgentUpdate): Promise<string | null> => {
      const current = agents.find((agent) => agent.id === id);
      const unchanged =
        current &&
        normalizeName(changes.name ?? current.name) === current.name &&
        (changes.queue ?? current.queue) === current.queue &&
        (changes.status ?? current.status) === current.status;
      if (unchanged) {
        setEditing(null);
        notify('info', 'No hubo cambios que guardar.');
        return null;
      }
      const result = await updateAgent(id, changes);
      if (!result.ok) return result.error;
      setEditing(null);
      notify('success', `Se actualizaron los datos de ${result.value.name}.`);
      return null;
    },
    [agents, updateAgent, notify],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleting) return;
    const result = await removeAgent(deleting.id);
    setDeleting(null);
    if (result.ok) notify('success', `${result.value.name} se eliminó del panel.`);
    else notify('error', result.error);
  }, [deleting, removeAgent, notify]);

  const handleConfirmReset = useCallback(async () => {
    setConfirmReset(false);
    const result = await resetDemo();
    if (result.ok) {
      setFilters({ queue: 'all', status: 'all' });
      notify('success', 'Se restauró el equipo de ejemplo.');
    } else {
      notify('error', result.error);
    }
  }, [resetDemo, notify]);

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido principal
      </a>
      <Sidebar current={view} onNavigate={navigate} workingCount={workingCount} total={agents.length} />
      <MobileNav current={view} onNavigate={navigate} />

      <main id="main-content" tabIndex={-1} className="lg:pl-64 focus:outline-none">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {storageError && (
            <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{storageError} Los cambios se mantienen mientras la pestaña siga abierta.</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500" role="status">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Cargando datos de la demo…
            </div>
          ) : (
            <>
              {view === 'panel' && (
                <Dashboard
                  agents={agents}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onAddAgent={handleAdd}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              )}
              {view === 'queues' && <QueueOverview agents={agents} onStatusChange={handleStatusChange} />}
              {view === 'coverage' && <TicketCoverage agents={agents} />}
              {view === 'settings' && (
                <DemoSettings agentCount={agents.length} onRequestReset={() => setConfirmReset(true)} />
              )}
            </>
          )}

          <footer className="mt-10 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
            Prototipo académico de prácticas · Departamento Legal, Carrier Compliance. Funciona sin
            conexión con sistemas corporativos y con datos ficticios.
          </footer>
        </div>
      </main>

      <EditAgentDialog agent={editing} onCancel={() => setEditing(null)} onSave={handleSaveEdit} />
      <ConfirmationDialog
        open={deleting !== null}
        title="¿Eliminar agente?"
        message={
          deleting ? (
            <>
              Se eliminará a <strong className="font-semibold text-slate-800">{deleting.name}</strong> (
              {deleting.queue}) del panel. Esta acción no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Eliminar agente"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
      <ConfirmationDialog
        open={confirmReset}
        title="¿Restaurar datos de ejemplo?"
        message="Se reemplazará la lista actual de agentes por el equipo ficticio inicial. Los cambios realizados se perderán."
        confirmLabel="Restaurar datos"
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
