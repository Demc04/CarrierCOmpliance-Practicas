import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ViewId } from '../../hooks/useHashView';
import { Brand, NavLinks } from './Sidebar';

interface MobileNavProps {
  current: ViewId;
  onNavigate: (view: ViewId) => void;
}

/** Barra superior con menú desplegable para pantallas pequeñas y tablets. */
export function MobileNav({ current, onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-navy-900 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Brand />
        <button
          ref={toggleRef}
          type="button"
          className="rounded-lg p-2 text-white hover:bg-white/10 focus-visible:outline-white/70"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Navegación principal"
          className="border-t border-white/10 px-3 pt-2 pb-4"
        >
          <NavLinks
            current={current}
            onNavigate={(view) => {
              onNavigate(view);
              setOpen(false);
            }}
          />
        </nav>
      )}
    </header>
  );
}
