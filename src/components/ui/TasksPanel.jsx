import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Calendar, CheckCircle2, Circle, Clock, Plus, Trash2, Edit3 } from 'lucide-react';
import { Modal } from './Modal';
import { TaskForm } from '../forms/TaskForm';

export const TasksPanel = ({ groupId }) => {
  const { tasks, students, updateTask, deleteTask } = useContext(AppContext);
  const groupTasks = tasks.filter(t => t.groupId === groupId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completada': return <CheckCircle2 size={18} color="var(--status-completed)" />;
      case 'En progreso': return <Clock size={18} color="var(--status-inprogress)" />;
      default: return <Circle size={18} color="var(--status-pending)" />;
    }
  };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || 'Sin asignar';

  const handleEdit = (task) => { setEditingTask(task); setIsModalOpen(true); };
  const handleCreate = () => { setEditingTask(null); setIsModalOpen(true); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Seguimiento de Tareas</h3>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} /> Nueva Tarea
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {groupTasks.length > 0 ? groupTasks.map(task => (
           <div key={task.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             {getStatusIcon(task.status)}
             <div style={{ flex: 1 }}>
               <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{task.title}</h4>
               <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                 <span>Asignado a: <strong style={{color: 'var(--text-primary)'}}>{getStudentName(task.assigneeId)}</strong></span>
                 <span style={{display:'flex', alignItems:'center', gap:'0.25rem'}}><Calendar size={14}/> {new Date(task.dueDate).toLocaleDateString()}</span>
               </div>
             </div>
             <div>
                <select value={task.status} onChange={e => updateTask(task.id, {status: e.target.value})} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completada">Completada</option>
                </select>
             </div>
             <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
               <button className="btn-ghost" style={{ padding: '0.25rem', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => handleEdit(task)}><Edit3 size={16} /></button>
               <button className="btn-ghost" style={{ padding: '0.25rem', border: 'none', cursor: 'pointer', color: 'var(--status-inactive)' }} onClick={() => deleteTask(task.id)}><Trash2 size={16} /></button>
             </div>
           </div>
        )) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
            <p>No hay tareas registradas para este grupo.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? "Editar Tarea" : "Nueva Tarea"}>
        <TaskForm task={editingTask} groupId={groupId} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
