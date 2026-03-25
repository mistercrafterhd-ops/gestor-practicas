import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { StudentForm } from '../components/forms/StudentForm';

export default function StudentsList({ userRole = 'usuario' }) {
  const {
    groups,
    filteredStudents,
    selectedGroupId,
    setSelectedGroupId,
    deleteStudent,
    loading,
    attendance,
    markAttendance,
  } = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = userRole === 'admin';
  const canCreateStudents = ['admin', 'usuario'].includes(userRole);
  const canManageAttendance = ['admin', 'usuario'].includes(userRole);

  const today = new Date().toISOString().split('T')[0];

  const selectedGroupName = useMemo(() => {
    if (selectedGroupId === 'all') return 'Todos los grupos';
    return groups.find((g) => String(g.id) === String(selectedGroupId))?.name || 'Grupo';
  }, [groups, selectedGroupId]);

  const getGroupName = (groupId) => {
    return groups.find((g) => String(g.id) === String(groupId))?.name || 'Sin grupo';
  };

  const searchedStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return filteredStudents;

    return filteredStudents.filter((student) => {
      const studentName = student.name?.toLowerCase() || '';
      const studentObservations = student.observations?.toLowerCase() || '';
      const groupName = getGroupName(student.groupId)?.toLowerCase() || '';

      return (
        studentName.includes(term) ||
        studentObservations.includes(term) ||
        groupName.includes(term)
      );
    });
  }, [filteredStudents, searchTerm, groups]);

  const groupedStudents = useMemo(() => {
    const map = new Map();

    searchedStudents.forEach((student) => {
      const key = student.name?.trim().toLowerCase();

      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          ...student,
          id: student.id,
          ids: [student.id],
          groupIds: student.groupId ? [student.groupId] : [],
        });
      } else {
        const existing = map.get(key);

        existing.ids.push(student.id);

        if (!existing.id) {
          existing.id = student.id;
        }

        if (
          student.groupId &&
          !existing.groupIds.some((id) => String(id) === String(student.groupId))
        ) {
          existing.groupIds.push(student.groupId);
        }

        if (!existing.observations && student.observations) {
          existing.observations = student.observations;
        }

        if ((existing.progress ?? 0) < (student.progress ?? 0)) {
          existing.progress = student.progress ?? 0;
        }

        if (!existing.startDate && student.startDate) {
          existing.startDate = student.startDate;
        }

        if (
          existing.status?.toLowerCase() !== 'activo' &&
          student.status?.toLowerCase() === 'activo'
        ) {
          existing.status = student.status;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchedStudents]);

  const getTodayAttendanceStatus = (student) => {
    const relatedAttendance = attendance.filter(
      (a) =>
        student.ids.some((id) => String(id) === String(a.studentId)) &&
        String(a.date).slice(0, 10) === today
    );

    if (relatedAttendance.some((a) => a.status === 'Asiste')) return 'Asiste';
    if (relatedAttendance.some((a) => a.status === 'Falta')) return 'Falta';
    return null;
  };

  const handleAttendance = async (student, status) => {
    if (!canManageAttendance) return;

    try {
      const results = await Promise.all(
        student.ids.map((id) => markAttendance(id, today, status))
      );

      const failed = results.find((r) => !r?.ok);

      if (failed) {
        console.error('Error real al guardar asistencia:', failed.error);
        alert(`No se pudo guardar la asistencia: ${failed.error}`);
        return;
      }
    } catch (error) {
      console.error('Error marcando asistencia:', error);
      alert('Hubo un error al marcar la asistencia.');
    }
  };

  const handleEdit = (student) => {
    if (!isAdmin) return;

    const realStudent = filteredStudents.find(
      (s) => String(s.id) === String(student.ids?.[0])
    );

    if (!realStudent) {
      alert('No se pudo cargar el alumno para editar.');
      return;
    }

    setEditingStudent(realStudent);
    setShowModal(true);
  };

  const handleDeleteGrouped = async (student) => {
    if (!isAdmin) return;

    const ok = window.confirm(
      `¿Seguro que quieres eliminar a "${student.name}"?\n\nSe eliminarán todos sus registros en los grupos donde aparezca.`
    );
    if (!ok) return;

    for (const id of student.ids) {
      await deleteStudent(id);
    }
  };

  const handleNewStudent = () => {
    if (!canCreateStudents) return;
    setEditingStudent(null);
    setShowModal(true);
  };

  return (
    <div className="content-area animate-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            Alumnos
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Mostrando: {selectedGroupName}
          </p>
        </div>

        {canCreateStudents && (
          <button className="btn btn-primary" onClick={handleNewStudent}>
            + Nuevo Alumno
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
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

      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar alumno por nombre, grupo u observaciones..."
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Cargando alumnos...</p>
          </div>
        ) : groupedStudents.length === 0 ? (
          <div style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              {searchTerm.trim()
                ? 'No hay alumnos que coincidan con la búsqueda.'
                : 'No hay alumnos en el grupo seleccionado.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: isAdmin ? '1120px' : '980px',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Grupo(s)</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Asistencia hoy</th>
                  <th style={thStyle}>Fecha inicio</th>
                  <th style={thStyle}>Observaciones</th>
                  <th style={thStyle}>Progreso</th>
                  {isAdmin && <th style={thStyle}>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {groupedStudents.map((student) => {
                  const todayStatus = getTodayAttendanceStatus(student);

                  return (
                    <tr key={student.name} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {student.name}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {student.groupIds.length > 0 ? (
                            student.groupIds.map((groupId) => (
                              <span
                                key={`${student.name}-${groupId}`}
                                className="badge"
                                style={{
                                  backgroundColor: 'var(--bg-hover)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {getGroupName(groupId)}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>Sin grupo</span>
                          )}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span
                          className={`badge ${
                            student.status?.toLowerCase() === 'activo'
                              ? 'status-activo'
                              : student.status?.toLowerCase() === 'inactivo'
                              ? 'status-inactivo'
                              : ''
                          }`}
                        >
                          {student.status || 'Sin estado'}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div>
                            {todayStatus ? (
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    todayStatus === 'Asiste'
                                      ? 'var(--status-active-bg)'
                                      : 'var(--status-inactive-bg)',
                                  color:
                                    todayStatus === 'Asiste'
                                      ? 'var(--status-active)'
                                      : 'var(--status-inactive)',
                                }}
                              >
                                {todayStatus}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                Sin registrar
                              </span>
                            )}
                          </div>

                          {canManageAttendance && (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                className="btn-ghost"
                                style={{
                                  ...attendanceButtonStyle,
                                  color: 'var(--status-active)',
                                  border: '1px solid var(--border-color)',
                                }}
                                onClick={() => handleAttendance(student, 'Asiste')}
                                title="Marcar asistencia"
                              >
                                <Check size={15} />
                                Asiste
                              </button>

                              <button
                                type="button"
                                className="btn-ghost"
                                style={{
                                  ...attendanceButtonStyle,
                                  color: 'var(--status-inactive)',
                                  border: '1px solid var(--border-color)',
                                }}
                                onClick={() => handleAttendance(student, 'Falta')}
                                title="Marcar falta"
                              >
                                <X size={15} />
                                Falta
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {student.startDate
                            ? new Date(student.startDate).toLocaleDateString()
                            : 'No definida'}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            color: 'var(--text-secondary)',
                            maxWidth: '220px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={student.observations || 'Sin observaciones'}
                        >
                          {student.observations || 'Sin observaciones'}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ minWidth: '140px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '0.35rem',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                            }}
                          >
                            <span>Progreso</span>
                            <span style={{ color: 'var(--accent-primary)' }}>
                              {student.progress ?? 0}%
                            </span>
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-bar"
                              style={{ width: `${student.progress ?? 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {isAdmin && (
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn-ghost"
                              style={iconButtonStyle}
                              onClick={() => handleEdit(student)}
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              className="btn-ghost"
                              style={{ ...iconButtonStyle, color: 'var(--status-inactive)' }}
                              onClick={() => handleDeleteGrouped(student)}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canCreateStudents && (
        <Modal
          isOpen={showModal}
          title={editingStudent ? 'Editar Alumno' : 'Nuevo Alumno'}
          onClose={() => {
            setShowModal(false);
            setEditingStudent(null);
          }}
        >
          <StudentForm
            student={editingStudent}
            onClose={() => {
              setShowModal(false);
              setEditingStudent(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '1rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const tdStyle = {
  padding: '1rem',
  verticalAlign: 'middle',
};

const iconButtonStyle = {
  padding: '0.4rem',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  borderRadius: '8px',
};

const attendanceButtonStyle = {
  padding: '0.35rem 0.55rem',
  background: 'transparent',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.78rem',
  fontWeight: '600',
};