import { Headset, LayoutDashboard, Layers, Settings2, type LucideIcon } from 'lucide-react';
import type { ViewId } from '../../hooks/useHashView';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'panel', label: 'Panel general', icon: LayoutDashboard },
  { id: 'queues', label: 'Vista por queue', icon: Layers },
  { id: 'coverage', label: 'Cobertura de tickets', icon: Headset },
  { id: 'settings', label: 'Datos de la demo', icon: Settings2 },
];
