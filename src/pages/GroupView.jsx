import React, { useContext, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { StudentCard } from '../components/ui/StudentCard';
import { ArrowLeft, Target, ListTodo, Plus, Users, CalendarCheck } from 'lucide-react';
import { TasksPanel } from '../components/ui/TasksPanel';
import { AttendancePanel } from '../components/ui/AttendancePanel';
import { Modal } from '../components/ui/Modal';
import { StudentForm } from '../components/forms/StudentForm';

const GroupView = () => {
  const { id } = useParams();

  const {
    groups,
    students,
    getStudentsByGroup,
    deleteStudent,
    loading,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('alumnos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const groupId = String(id);

  const group = useMemo(
    () => groups.find((g) => String(g.id) === groupId),
    [groups, groupId]
  );

  const baseGroupStudents = useMemo(() => {
    try {
      return getStudentsByGroup(groupId) || [];
    } catch (error) {
      console.error('Error obteniendo alumnos del grupo:', error);
      return [];
    }
  }, [getStudentsByGroup, groupId]);

  const groupStudents = useMemo(() => {
    let result = [...baseGroupStudents];

    if (searchTerm.trim()) {
      result = result.filter((s) =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'Todos') {
      result = result.filter((s) => s.status === filterStatus);
    }

    return result;
  }, [baseGroupStudents, searchTerm, filterStatus]);

  const handleDelete = async (studentId) => {
    const ok = window.confirm('¿Seguro que deseas eliminar este alumno?');
    if (!ok) return;
    await deleteStudent(studentId);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleCreateStudent = () => {
    setEditingStudent({
      groupId: id,
      name: '',
      status: 'Activo',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      observations: '',
    });
    setIsStudentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="content-area">
        <div className="card">Cargando grupo...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="content-area">
        <div className="card">
          <h2 style={{ marginBottom: '0.5rem' }}>Grupo no encontrado</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            No se encontró el grupo con id: {groupId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/groups"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          <ArrowLeft size={16} /> Volver a Grupos
        </Link>
      </div>

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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <h1
              style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
              }}
            >
              {group.name}
            </h1>
            <span
              className="badge"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
            >
              Grupo
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestión de alumnos, tareas y asistencia para este grupo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleCreateStudent}>
            <Plus size={18} /> Añadir Alumno
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: '1rem',
          background: '#fffbe6',
          border: '1px solid #f5e6a8',
        }}
      >
        <div style={{ fontSize: '0.9rem', color: '#6b5b00' }}>
          <strong>Depuración:</strong> grupo actual = {group.name} | id ruta = {groupId} | alumnos
          cargados totales = {students.length} | alumnos de este grupo = {baseGroupStudents.length}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => setActiveTab('alumnos')}
          style={tabStyle(activeTab === 'alumnos')}
        >
          <Users size={18} /> Alumnos
        </button>

        <button
          onClick={() => setActiveTab('tareas')}
          style={tabStyle(activeTab === 'tareas')}
        >
          <ListTodo size={18} /> Tareas
        </button>

        <button
          onClick={() => setActiveTab('asistencia')}
          style={tabStyle(activeTab === 'asistencia')}
        >
          <CalendarCheck size={18} /> Asistencia
        </button>
      </div>

      {activeTab === 'alumnos' && (
        <>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Buscar alumno por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ maxWidth: '220px' }}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>

            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
              }}
            >
              <span>
                Total: <strong>{groupStudents.length}</strong> alumnos filtrados
              </span>
            </div>
          </div>

          <div className="grid-cards">
            {groupStudents.length > 0 ? (
              groupStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onEdit={handleEditStudent}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '3rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-color)',
                }}
              >
                <Target size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>No se encontraron alumnos que coincidan con los filtros.</p>

                {baseGroupStudents.length === 0 && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                    Este grupo no está recibiendo alumnos asociados por `groupId`.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'tareas' && <TasksPanel groupId={id} />}
      {activeTab === 'asistencia' && <AttendancePanel groupId={id} />}

      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={editingStudent?.id ? 'Editar Alumno' : 'Nuevo Alumno'}
      >
        <StudentForm
          student={editingStudent}
          onClose={() => setIsStudentModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const tabStyle = (active) => ({
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
  padding: '0.5rem 0',
  fontWeight: '600',
  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
});

export default GroupView;