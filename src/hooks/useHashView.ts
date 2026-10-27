import { useCallback, useEffect, useState } from 'react';

export type ViewId = 'panel' | 'queues' | 'coverage' | 'demo-data';

const VIEW_IDS: readonly ViewId[] = ['panel', 'queues', 'coverage', 'demo-data'];

function readView(): ViewId {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return (VIEW_IDS as readonly string[]).includes(hash) ? (hash as ViewId) : 'panel';
}

/** Navegación mínima basada en el hash de la URL (sin dependencias de routing). */
export function useHashView(): [ViewId, (view: ViewId) => void] {
  const [view, setView] = useState<ViewId>(readView);

  useEffect(() => {
    const onChange = () => setView(readView());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: ViewId) => {
    if (readView() !== next) window.location.hash = next;
    setView(next);
  }, []);

  return [view, navigate];
}
