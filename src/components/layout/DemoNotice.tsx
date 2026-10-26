import { Info } from 'lucide-react';

export function DemoNotice() {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700" />
      <p>
        <strong className="font-semibold">Demo sin conexión corporativa.</strong> Los datos son
        ficticios y se guardan únicamente en este navegador. No se conecta a Jira, Slack ni a
        sistemas de Lean Solutions Group, y no sincroniza información entre usuarios o equipos.
      </p>
    </div>
  );
}
