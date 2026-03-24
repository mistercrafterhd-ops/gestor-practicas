export const initialGroups = [
  { id: '1', name: 'Vertices' },
  { id: '2', name: 'Chollones' },
  { id: '3', name: 'Dosier' },
  { id: '4', name: 'Guias' },
  { id: '5', name: 'Onlybeauty' },
  { id: '6', name: 'Plugins' }
];

export const initialStudents = [
  { id: 's1', name: 'Ana García', groupId: '1', status: 'Activo', progress: 75, observations: 'Muy buen progreso inicial.', startDate: '2026-01-15' },
  { id: 's2', name: 'Carlos López', groupId: '1', status: 'Activo', progress: 40, observations: 'Necesita refuerzo en React.', startDate: '2026-02-01' },
  { id: 's3', name: 'María Martínez', groupId: '2', status: 'Inactivo', progress: 10, observations: 'Baja temporal por motivos personales.', startDate: '2026-01-20' },
  { id: 's4', name: 'Jorge Díaz', groupId: '3', status: 'Activo', progress: 90, observations: 'Casi finalizando.', startDate: '2025-11-10' },
  { id: 's5', name: 'Luis Fernando', groupId: '4', status: 'Activo', progress: 25, observations: '', startDate: '2026-02-15' },
  { id: 's6', name: 'Elena Torres', groupId: '5', status: 'Activo', progress: 60, observations: 'Buen desempeño.', startDate: '2026-01-05' },
];

export const initialTasks = [
  { id: 't1', title: 'Configurar entorno de desarrollo', groupId: '1', assigneeId: 's1', status: 'Completada', dueDate: '2026-01-20' },
  { id: 't2', title: 'Crear Componente Login', groupId: '1', assigneeId: 's2', status: 'En progreso', dueDate: '2026-03-25' },
  { id: 't3', title: 'Diseño de Base de Datos', groupId: '3', assigneeId: 's4', status: 'Pendiente', dueDate: '2026-03-30' }
];

export const initialAttendance = [
  { id: 'a1', studentId: 's1', date: new Date().toISOString().split('T')[0], status: 'Asiste' },
  { id: 'a2', studentId: 's2', date: new Date().toISOString().split('T')[0], status: 'Falta' },
];
