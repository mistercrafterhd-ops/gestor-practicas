import React, { useContext } from 'react';
import { Mail, Calendar, Edit3, Trash2 } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

export const StudentCard = ({ student, onEdit, onDelete }) => {
  const { groups } = useContext(AppContext);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'status-activo';
      case 'inactivo':
        return 'status-inactivo';
      default:
        return '';
    }
  };

  const groupName =
    groups.find((g) => String(g.id) === String(student.groupId))?.name ||
    'Sin grupo';

  const safeDate = student.startDate
    ? new Date(student.startDate).toLocaleDateString()
    : 'No definida';

  const progress = student.progress ?? 0;

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <button
          className="btn-ghost"
          style={{
            padding: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
          onClick={() => onEdit?.(student)}
          title="Editar"
        >
          <Edit3 size={16} />
        </button>

        <button
          className="btn-ghost"
          style={{
            padding: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--status-inactive)',
          }}
          onClick={() => onDelete?.(student.id)}
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--bg-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'var(--accent-primary)',
          }}
        >
          {student.name?.charAt(0) || '?'}
        </div>

        <div>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {student.name}
          </h3>

          <span
            className={`badge ${getStatusClass(student.status)}`}
            style={{ marginTop: '0.25rem' }}
          >
            {student.status || 'Sin estado'}
          </span>
        </div>
      </div>

      {/* NUEVO: grupo */}
      <div
        style={{
          fontSize: '0.8rem',
          marginBottom: '0.75rem',
          color: 'var(--text-secondary)',
        }}
      >
        Grupo: <strong>{groupName}</strong>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Calendar size={16} /> Inicio: {safeDate}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Mail size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {student.observations || 'Sin observaciones'}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginBottom: '0.5rem',
            fontWeight: '600',
          }}
        >
          <span>Progreso</span>
          <span style={{ color: 'var(--accent-primary)' }}>
            {progress}%
          </span>
        </div>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};