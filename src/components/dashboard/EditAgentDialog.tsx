import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { NAME_MAX_LENGTH, QUEUES, STATUSES, STATUS_META, isAgentStatus, isQueue } from '../../constants/agents';
import type { Agent, AgentStatus, AgentUpdate, Queue } from '../../types/agent';
import { Modal } from '../ui/Modal';

interface EditAgentDialogProps {
  agent: Agent | null;
  onCancel: () => void;
  /** Devuelve un mensaje de error si la edición falla, o null si fue correcta. */
  onSave: (id: string, changes: AgentUpdate) => Promise<string | null>;
}

export function EditAgentDialog({ agent, onCancel, onSave }: EditAgentDialogProps) {
  const [name, setName] = useState('');
  const [queue, setQueue] = useState<Queue>('Audits');
  const [status, setStatus] = useState<AgentStatus>('working');
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (!agent) return;
    setName(agent.name);
    setQueue(agent.queue);
    setStatus(agent.status);
    setError(null);
  }, [agent]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agent) return;
    if (!name.trim()) {
      setError('El nombre del agente es obligatorio.');
      nameRef.current?.focus();
      return;
    }
    const result = await onSave(agent.id, { name, queue, status });
    if (result) {
      setError(result);
      nameRef.current?.focus();
    }
  }

  const formId = `${id}-form`;
  const errorId = `${id}-error`;

  return (
    <Modal
      open={agent !== null}
      title="Editar agente"
      description={agent ? `Modifica los datos de ${agent.name}. La queue sigue siendo obligatoria.` : undefined}
      onClose={onCancel}
      initialFocusRef={nameRef}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" form={formId} className="btn-primary">
            Guardar cambios
          </button>
        </>
      }
    >
      <form id={formId} className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor={`${id}-name`} className="field-label">
            Nombre del agente
          </label>
          <input
            ref={nameRef}
            id={`${id}-name`}
            className="field-input"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="off"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
          />
          {error && (
            <p id={errorId} className="mt-1.5 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-queue`} className="field-label">
            Queue
          </label>
          <select
            id={`${id}-queue`}
            className="field-input"
            value={queue}
            required
            onChange={(event) => {
              const value = event.target.value;
              if (isQueue(value)) setQueue(value);
            }}
          >
            {QUEUES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-status`} className="field-label">
            Estado
          </label>
          <select
            id={`${id}-status`}
            className="field-input"
            value={status}
            onChange={(event) => {
              const value = event.target.value;
              if (isAgentStatus(value)) setStatus(value);
            }}
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_META[option].label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
