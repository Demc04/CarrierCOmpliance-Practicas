import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  notify: (tone: ToastTone, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION_MS = 4500;

const TONE_STYLES: Record<ToastTone, { icon: typeof Info; className: string; iconClass: string }> = {
  success: { icon: CheckCircle2, className: 'border-emerald-200', iconClass: 'text-emerald-600' },
  error: { icon: TriangleAlert, className: 'border-red-200', iconClass: 'text-red-600' },
  info: { icon: Info, className: 'border-slate-200', iconClass: 'text-brand-600' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
        role="status"
      >
        {toasts.map((toast) => {
          const style = TONE_STYLES[toast.tone];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 shadow-lg ${style.className}`}
            >
              <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${style.iconClass}`} />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                className="-m-1 rounded p-1 text-slate-400 hover:text-slate-700"
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  return context;
}
