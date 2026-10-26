import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { LocalStorageAgentRepository, STORAGE_KEY } from './services/localStorageAgentRepository';

function renderApp() {
  const user = userEvent.setup();
  const utils = render(<App repository={new LocalStorageAgentRepository()} />);
  return { user, ...utils };
}

async function ready() {
  await screen.findByRole('heading', { name: 'Estado del equipo' });
}

function statValue(label: string): string {
  const button = screen.getAllByRole('button', { pressed: false }).concat(screen.getAllByRole('button', { pressed: true }))
    .find((b) => b.textContent?.includes(label));
  if (!button) throw new Error(`Tarjeta ${label} no encontrada`);
  return button.textContent!.replace(label, '').trim();
}

function teamSection() {
  return screen.getByRole('region', { name: 'Estado del equipo' });
}

function visibleAgentNames() {
  return within(teamSection())
    .queryAllByRole('article')
    .map((article) => article.getAttribute('aria-label')!.replace('Agente ', ''));
}

describe('Panel de disponibilidad', () => {
  it('muestra el equipo de ejemplo y los contadores', async () => {
    renderApp();
    await ready();
    expect(visibleAgentNames()).toHaveLength(9);
    expect(statValue('Agentes registrados')).toBe('9');
    expect(statValue('Trabajando / disponible')).toBe('5');
    expect(statValue('En descanso')).toBe('1');
    expect(statValue('En almuerzo')).toBe('2');
    expect(statValue('Fuera de línea')).toBe('1');
  });

  it('valida el formulario, registra agentes y evita duplicados', async () => {
    const { user } = renderApp();
    await ready();
    const form = screen.getByRole('region', { name: 'Registrar agente' });
    const submit = within(form).getByRole('button', { name: /Agregar agente/ });

    await user.click(submit);
    expect(within(form).getByText('El nombre del agente es obligatorio.')).toBeInTheDocument();

    await user.type(within(form).getByLabelText(/Nombre del agente/), 'Agente 10');
    await user.click(submit);
    expect(within(form).getByText('Selecciona la queue del agente.')).toBeInTheDocument();

    await user.selectOptions(within(form).getByLabelText(/Queue/), 'LoadRule');
    expect(within(form).getByLabelText('Estado inicial')).toHaveValue('working');
    await user.click(submit);

    expect(await screen.findByText(/Agente 10 se registró en LoadRule/)).toBeInTheDocument();
    expect(within(form).getByLabelText(/Nombre del agente/)).toHaveValue('');
    expect(within(form).getByLabelText(/Queue/)).toHaveValue('');
    expect(statValue('Agentes registrados')).toBe('10');
    expect(statValue('Trabajando / disponible')).toBe('6');

    await user.type(within(form).getByLabelText(/Nombre del agente/), '  agente 10 ');
    await user.selectOptions(within(form).getByLabelText(/Queue/), 'Audits');
    await user.click(submit);
    expect(within(form).getByText(/Ya existe un agente llamado/)).toBeInTheDocument();
    expect(statValue('Agentes registrados')).toBe('10');
  });

  it('cambia el estado y actualiza los contadores y el almacenamiento', async () => {
    const { user } = renderApp();
    await ready();
    const card = screen.getByRole('article', { name: 'Agente Agente 01' });
    await user.selectOptions(within(card).getByLabelText('Cambiar estado'), 'lunch');
    expect(within(card).getAllByText('En almuerzo').length).toBeGreaterThan(0);
    expect(statValue('Trabajando / disponible')).toBe('4');
    expect(statValue('En almuerzo')).toBe('3');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.agents.find((a: { name: string }) => a.name === 'Agente 01').status).toBe('lunch');
  });

  it('filtra por queue, por estado, de forma combinada y limpia filtros', async () => {
    const { user } = renderApp();
    await ready();
    await user.selectOptions(screen.getByLabelText('Queue', { selector: '#filter-queue' }), 'Insurance');
    expect(visibleAgentNames()).toHaveLength(3);
    await user.selectOptions(screen.getByLabelText('Estado', { selector: '#filter-status' }), 'working');
    expect(visibleAgentNames().sort()).toEqual(['Agente 07', 'Agente 08']);
    await user.selectOptions(screen.getByLabelText('Queue', { selector: '#filter-queue' }), 'all');
    expect(visibleAgentNames()).toHaveLength(5);
    await user.selectOptions(screen.getByLabelText('Estado', { selector: '#filter-status' }), 'offline');
    await user.selectOptions(screen.getByLabelText('Queue', { selector: '#filter-queue' }), 'Audits');
    expect(screen.getByText('No hay agentes que coincidan con los filtros')).toBeInTheDocument();
    await user.click(within(teamSection()).getAllByRole('button', { name: /Limpiar filtros/ })[0]);
    expect(visibleAgentNames()).toHaveLength(9);
  });

  it('elimina un agente solo tras confirmar', async () => {
    const { user } = renderApp();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Eliminar Agente 02' }));
    const dialog = screen.getByRole('alertdialog', { name: '¿Eliminar agente?' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(visibleAgentNames()).toHaveLength(9);

    await user.click(screen.getByRole('button', { name: 'Eliminar Agente 02' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar agente' }));
    expect(visibleAgentNames()).toHaveLength(8);
    expect(visibleAgentNames()).not.toContain('Agente 02');
    expect(statValue('En almuerzo')).toBe('1');
  });

  it('edita nombre y queue sin permitir duplicados', async () => {
    const { user } = renderApp();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Editar Agente 01' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar agente' });
    const name = within(dialog).getByLabelText('Nombre del agente');
    await user.clear(name);
    await user.type(name, 'AGENTE 02');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
    expect(within(dialog).getByText(/Ya existe un agente llamado/)).toBeInTheDocument();

    await user.clear(name);
    await user.type(name, 'Agente Uno');
    await user.selectOptions(within(dialog).getByLabelText('Queue'), 'Insurance');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const card = screen.getByRole('article', { name: 'Agente Agente Uno' });
    expect(within(card).getByText('Insurance')).toBeInTheDocument();
  });

  it('persiste los cambios al volver a montar la aplicación (recarga)', async () => {
    const { user, unmount } = renderApp();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Eliminar Agente 09' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar agente' }));
    unmount();
    renderApp();
    await ready();
    expect(visibleAgentNames()).toHaveLength(8);
    expect(visibleAgentNames()).not.toContain('Agente 09');
  });

  it('restaura los datos de ejemplo tras confirmar', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, agents: [] }));
    window.location.hash = '/settings';
    const { user } = renderApp();
    await screen.findByRole('heading', { name: 'Datos de la demo', level: 1 });
    await user.click(screen.getByRole('button', { name: /Restaurar datos de ejemplo/ }));
    await user.click(screen.getByRole('button', { name: 'Restaurar datos' }));
    expect(await screen.findByText('Se restauró el equipo de ejemplo.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).agents).toHaveLength(9);
  });

  it('la vista por queue y la cobertura reflejan los cambios', async () => {
    window.location.hash = '/queues';
    const { user } = renderApp();
    const audits = await screen.findByRole('region', { name: 'Audits' });
    expect(within(audits).getByText('disponibles / total').previousSibling?.textContent).toMatch(/2\s*\/\s*3/);
    await user.selectOptions(within(audits).getByLabelText('Cambiar estado de Agente 01'), 'break');
    expect(within(audits).getByText('disponibles / total').previousSibling?.textContent).toMatch(/1\s*\/\s*3/);

    await user.click(screen.getAllByRole('link', { name: 'Cobertura de tickets' })[0]);
    const auditsCoverage = await screen.findByRole('region', { name: 'Audits' });
    expect(within(auditsCoverage).getByText('1 agente trabajando / disponible')).toBeInTheDocument();
    expect(screen.getByText(/solo una referencia visual/)).toBeInTheDocument();
  });
});
