import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Trash2 } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

export const GroupCard = ({ group, tasks }) => {
  const navigate = useNavigate();
  const { deleteGroup, getStudentsByGroup } = useContext(AppContext);
  
const groupStudents = useMemo(() => {
  if (!getStudentsByGroup) return [];
  return getStudentsByGroup(group.id) || [];
}, [getStudentsByGroup, group.id]);

const activeStudents = groupStudents.filter((s) => s.status === 'Activo').length;

const groupTasks = (tasks || []).filter(
  (t) => String(t.groupId) === String(group.id)
);

const completedTasks = groupTasks.filter((t) => t.status === 'Completada').length;

  const progressPercent =
    groupTasks.length > 0
      ? Math.round((completedTasks / groupTasks.length) * 100)
      : 0;

  const handleDeleteGroup = async (e) => {
    e.stopPropagation();

    const ok = window.confirm(
      `¿Seguro que quieres eliminar el grupo "${group.name}"?`
    );

    if (!ok) return;

    const result = await deleteGroup(group.id);

    if (!result?.ok) {
      alert(result?.error || 'No se pudo eliminar el grupo');
    }
  };

  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onClick={() => navigate(`/groups/${group.id}`)}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            {group.name}
          </h3>

          <span
            className="badge"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            ID: {group.id}
          </span>
        </div>

        <button
          onClick={handleDeleteGroup}
          title="Eliminar grupo"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '8px',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          <Users size={16} /> {groupStudents.length} alumnos
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          <Users size={16} /> {activeStudents} activos
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          <BookOpen size={16} /> {groupTasks.length} tareas
        </div>
      </div>

      <div
        style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          borderRadius: '12px',
          background: 'var(--bg-secondary)',
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem',
          }}
        >
          Alumnos del grupo
        </p>

        {groupStudents.length === 0 ? (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            No hay alumnos asignados
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {groupStudents.slice(0, 3).map((student) => (
              <div
                key={student.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                }}
              >
                <span>{student.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {student.status || 'Sin estado'}
                </span>
              </div>
            ))}

            {groupStudents.length > 3 && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  margin: '0.25rem 0 0 0',
                }}
              >
                +{groupStudents.length - 3} más
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginBottom: '0.5rem',
            fontWeight: '600',
          }}
        >
          <span>Progreso General</span>
          <span>{progressPercent}%</span>
        </div>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};