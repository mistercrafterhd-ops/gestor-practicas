import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { StatCard } from '../components/ui/StatCard';
import { GroupCard } from '../components/ui/GroupCard';
import { StudentCard } from '../components/ui/StudentCard';
import {
  Users,
  CheckCircle,
  Activity,
  AlertTriangle,
  LogOut,
  Shield,
} from 'lucide-react';

const Dashboard = ({ userProfile, session }) => {
  const {
    groups,
    students,
    tasks,
    addGroup,
    filteredStudents,
    selectedGroupId,
    setSelectedGroupId,
    loading,
  } = useContext(AppContext);

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupError, setGroupError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const activeCount = students.filter((s) => s.status === 'Activo').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completada').length;
  const pendingTasks = tasks.length - completedTasks;
  const inactiveStudents = students.filter((s) => s.status === 'Inactivo');

  const selectedGroupName = useMemo(() => {
    if (selectedGroupId === 'all') return 'Todos los grupos';
    return groups.find((g) => String(g.id) === String(selectedGroupId))?.name || 'Grupo';
  }, [groups, selectedGroupId]);

  const displayName =
    userProfile?.nombre ||
    session?.user?.user_metadata?.nombre ||
    session?.user?.email?.split('@')[0] ||
    'Usuario';

  const userRole = userProfile?.rol || 'usuario';

  const canCreateGroup = ['admin', 'coordinador'].includes(userRole);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!canCreateGroup) {
      setGroupError('No tienes permisos para crear grupos');
      return;
    }

    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setGroupError('El nombre del grupo es obligatorio');
      return;
    }

    const result = await addGroup({ name: trimmedName });

    if (!result?.ok) {
      setGroupError(result?.error || 'No se pudo crear el grupo');
      return;
    }

    setNewGroupName('');
    setGroupError('');
    setShowNewGroupModal(false);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="content-area animate-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            Bienvenido, {displayName} 👋
          </h1>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '0.4rem',
            }}
          >
            <p
              style={{
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              Este es el resumen de la plataforma de prácticas hoy.
            </p>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.7rem',
                borderRadius: '999px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
              <Shield size={14} />
              Rol: {userRole}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            Exportar Reporte
          </button>

          {canCreateGroup && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowNewGroupModal(true);
                setGroupError('');
              }}
            >
              + Nuevo Grupo
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
            }}
          >
            <LogOut size={16} />
            {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      {showNewGroupModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              background: 'var(--bg-primary)',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              Crear nuevo grupo
            </h3>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Añade un nuevo grupo de prácticas para organizar a tus alumnos.
            </p>

            <form onSubmit={handleCreateGroup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label
                  htmlFor="new-group-name"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                  }}
                >
                  Nombre del grupo
                </label>

                <input
                  id="new-group-name"
                  type="text"
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value);
                    if (groupError) setGroupError('');
                  }}
                  placeholder="Ej: Marketing, Desarrollo, Diseño..."
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {groupError && (
                <p
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.85rem',
                    color: 'crimson',
                  }}
                >
                  {groupError}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowNewGroupModal(false);
                    setNewGroupName('');
                    setGroupError('');
                  }}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn btn-primary">
                  Guardar grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-stats">
        <StatCard
          title="Alumnos Activos"
          value={activeCount}
          icon={<Users size={24} />}
          color="var(--accent-primary)"
          trend="+12% este mes"
        />
        <StatCard
          title="Tareas Completadas"
          value={completedTasks}
          icon={<CheckCircle size={24} />}
          color="var(--status-active)"
        />
        <StatCard
          title="Tareas Pendientes"
          value={pendingTasks}
          icon={<Activity size={24} />}
          color="var(--status-pending)"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '1rem',
            }}
          >
            Grupos de Prácticas
          </h2>

          <div className="grid-cards">
{groups.map((g) => (
  <GroupCard key={g.id} group={g} students={students} tasks={tasks} />
))}
          </div>
        </div>

        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '1rem',
            }}
          >
            Alertas y Avisos
          </h2>

          <div
            className="card"
            style={{
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {inactiveStudents.length > 0 ? (
              inactiveStudents.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'var(--status-inactive-bg)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <AlertTriangle
                    size={18}
                    color="var(--status-inactive)"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  />
                  <div>
                    <h4
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--status-inactive)',
                      }}
                    >
                      Alumno Inactivo: {s.name}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(244, 63, 94, 0.8)',
                        marginTop: '0.25rem',
                      }}
                    >
                      {s.observations || 'Sin observaciones recientes'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}
              >
                No hay alertas recientes.
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'var(--status-pending-bg)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <AlertTriangle
                size={18}
                color="var(--status-pending)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <h4
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--status-pending)',
                  }}
                >
                  {pendingTasks} Tareas Pendientes
                </h4>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(245, 158, 11, 0.8)',
                    marginTop: '0.25rem',
                  }}
                >
                  Revisar progreso general
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '0.25rem',
              }}
            >
              Lista de alumnos
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}
            >
              Mostrando: {selectedGroupName}
            </p>
          </div>

          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            style={{
              minWidth: '240px',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.95rem',
            }}
          >
            <option value="all">Todos los grupos</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando alumnos...</p>
        ) : filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            No hay alumnos en el grupo seleccionado.
          </p>
        ) : (
          <div className="grid-cards">
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;