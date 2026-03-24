import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

export const TaskForm = ({ task, groupId, onClose }) => {
  const { students, groups, addTask, updateTask } = useContext(AppContext);
  const isEditing = !!task?.id;

  const [formData, setFormData] = useState({
    title: '',
    groupId: groupId || groups[0]?.id || '',
    assigneeId: '',
    status: 'Pendiente',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const groupStudents = students.filter(s => (!formData.groupId || s.groupId === formData.groupId) && s.status === 'Activo');

  useEffect(() => {
    if (task) setFormData(task);
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) updateTask(task.id, formData);
    else addTask(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Título de la Tarea</label>
        <input type="text" name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Ej. Desarrollar componente Footer" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Grupo</label>
          <select name="groupId" value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value, assigneeId: ''})} required disabled={!!groupId}>
             {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Asignar a Alumno</label>
          <select name="assigneeId" value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})} required>
            <option value="">Seleccione un alumno...</option>
            {groupStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Estado</label>
          <select name="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Fecha de Entrega</label>
          <input type="date" name="dueDate" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary">{isEditing ? 'Guardar Cambios' : 'Crear Tarea'}</button>
      </div>
    </form>
  );
};
