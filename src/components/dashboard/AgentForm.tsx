import { UserPlus } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { DEFAULT_STATUS, NAME_MAX_LENGTH, QUEUES, STATUSES, STATUS_META, isAgentStatus, isQueue } from '../../constants/agents';
import type { AgentStatus, NewAgentInput, Queue } from '../../types/agent';

interface AgentFormProps {
  /** Devuelve un mensaje de error si el registro falla, o null si fue correcto. */
  onSubmit: (input: NewAgentInput) => Promise<string | null>;
}

interface FormErrors {
  name?: string;
  queue?: string;
}

export function AgentForm({ onSubmit }: AgentFormProps) {
  const [name, setName] = useState('');
  const [queue, setQueue] = useState<Queue | ''>('');
  const [status, setStatus] = useState<AgentStatus>(DEFAULT_STATUS);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<HTMLSelectElement>(null);
  const id = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = 'El nombre del agente es obligatorio.';
    if (!queue) nextErrors.queue = 'Selecciona la queue del agente.';
    setErrors(nextErrors);
    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.queue || !queue) return queueRef.current?.focus();

    setSubmitting(true);
    const error = await onSubmit({ name, queue, status });
    setSubmitting(false);
    if (error) {
      setErrors({ name: error });
      nameRef.current?.focus();
      return;
    }
    setName('');
    setQueue('');
    setStatus(DEFAULT_STATUS);
    setErrors({});
    nameRef.current?.focus();
  }

  const nameErrorId = `${id}-name-error`;
  const queueErrorId = `${id}-queue-error`;

  return (
    <section className="card p-5" aria-labelledby={`${id}-title`}>
      <div className="flex items-center gap-2">
        <UserPlus aria-hidden="true" className="size-5 text-brand-600" />
        <h2 id={`${id}-title`} className="text-base font-semibold text-slate-900">
          Registrar agente
        </h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Usa nombres ficticios. Los campos marcados con <span aria-hidden="true">*</span>
        <span className="sr-only">asterisco</span> son obligatorios.
      </p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor={`${id}-name`} className="field-label">
            Nombre del agente <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            ref={nameRef}
            id={`${id}-name`}
            className="field-input"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            placeholder="Ej. Agente 10"
            autoComplete="off"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? nameErrorId : undefined}
            onChange={(event) => {
              setName(event.target.value);
              if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
            }}
          />
          {errors.name && (
            <p id={nameErrorId} className="mt-1.5 text-sm text-red-700" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-queue`} className="field-label">
            Queue <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <select
            ref={queueRef}
            id={`${id}-queue`}
            className="field-input"
            value={queue}
            required
            aria-invalid={Boolean(errors.queue)}
            aria-describedby={errors.queue ? queueErrorId : undefined}
            onChange={(event) => {
              const value = event.target.value;
              setQueue(isQueue(value) ? value : '');
              if (errors.queue) setErrors((current) => ({ ...current, queue: undefined }));
            }}
          >
            <option value="">Selecciona una queue</option>
            {QUEUES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.queue && (
            <p id={queueErrorId} className="mt-1.5 text-sm text-red-700" role="alert">
              {errors.queue}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-status`} className="field-label">
            Estado inicial
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

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          <UserPlus aria-hidden="true" className="size-4" />
          Agregar agente
        </button>
      </form>
    </section>
  );
}
