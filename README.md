# Disponibilidad de agentes · Carrier Compliance

Prototipo académico de prácticas (Lean Solutions Group · Departamento Legal · equipo de Carrier Compliance).
Permite registrar agentes ficticios, asignarles una queue (**Audits**, **LoadRule** o **Insurance**),
actualizar su estado de disponibilidad y consultar el equipo por queue.

> **Demo sin conexión corporativa.** Usa datos ficticios y guarda la información solo en el
> navegador (`localStorage`). No se conecta a Jira, Slack, bases de datos ni APIs de la empresa y
> **no es una plataforma multiusuario en tiempo real**.

## Requisitos

- Node.js 20.19 o superior (probado con Node 22) y npm.

## Puesta en marcha

```bash
npm install        # instalar dependencias
npm run dev        # iniciar en modo desarrollo
```

Abre <http://localhost:5173> en el navegador.

| Comando             | Descripción                                          |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo con recarga automática        |
| `npm run build`     | Comprobación de tipos + compilación en `dist/`       |
| `npm run preview`   | Sirve la compilación de producción (puerto 4173)     |
| `npm run typecheck` | Solo comprobación de tipos de TypeScript             |
| `npm test`          | Pruebas automatizadas (Vitest + Testing Library)     |

## Funcionalidades

- **Panel general**: tarjetas de estadísticas (total, trabajando, descanso, almuerzo, fuera de línea)
  que además funcionan como filtro rápido; formulario de registro; filtros combinables por queue y
  estado con opción de limpiar; tarjetas de agente con cambio de estado, edición y eliminación con
  confirmación.
- **Vista por queue**: agentes agrupados por Audits, LoadRule e Insurance con totales y disponibles.
- **Cobertura de tickets**: referencia visual por queue de quién figura como trabajando / disponible,
  en descanso o en almuerzo. No asigna tickets ni aplica reglas de capacidad.
- **Datos de la demo**: restauración confirmada del equipo de ejemplo y descripción del alcance.
- Validaciones (nombre obligatorio, sin duplicados ignorando mayúsculas, queue obligatoria),
  notificaciones, estados vacíos, navegación por teclado, diseño responsive.

## Estructura

```
src/
  App.tsx                     Composición de vistas, diálogos y acciones
  types/agent.ts              Tipos de dominio
  constants/agents.ts         Queues, estados y etiquetas
  data/demoAgents.ts          Equipo de ejemplo ficticio
  lib/agents.ts               Lógica pura: validación, filtros, conteos, agrupación
  services/
    agentRepository.ts        Contrato de persistencia (interfaz)
    localStorageAgentRepository.ts  Implementación local con recuperación de datos dañados
  hooks/useAgents.ts          Estado de agentes (usa solo el contrato del repositorio)
  hooks/useHashView.ts        Navegación por hash (#/panel, #/queues, #/coverage, #/settings)
  components/
    layout/                   Sidebar, menú móvil, encabezado, aviso de demo
    dashboard/                Dashboard, StatisticsCards, AgentForm, AgentList, AgentCard,
                              QueueFilters, EditAgentDialog
    queues/QueueOverview.tsx
    coverage/TicketCoverage.tsx
    settings/DemoSettings.tsx
    ui/                       Modal, ConfirmationDialog, Toast, StatusBadge, StatusSelect, ...
prototipo/                    Prototipo HTML original (sin modificar)
```

## Hacia una versión multiusuario

La interfaz depende únicamente de `AgentRepository`. Para una versión real habría que, con
autorización de la empresa: crear un backend compartido (API + base de datos), implementar un
`ApiAgentRepository` con el mismo contrato, añadir autenticación corporativa (SSO) y permisos por
rol, sincronización en tiempo real (WebSockets o similar), auditoría de cambios y despliegue en la
infraestructura aprobada por TI y Seguridad.
