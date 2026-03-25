import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';

export const StudentForm = ({ student, onClose }) => {
  const { groups, students, addStudent, updateStudent } = useContext(AppContext);
  const isEditing = !!student?.id;

  const [mode, setMode] = useState('manual');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    groupId: '',
    status: 'Activo',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    observations: '',
  });

  const selectableStudents = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  useEffect(() => {
    if (student) {
      setMode('manual');
      setSelectedStudentId(student.id);
      setFormData({
        name: student.name || '',
        groupId: student.groupId || groups[0]?.id || '',
        status: student.status || 'Activo',
        progress: student.progress ?? 0,
        startDate: student.startDate || new Date().toISOString().split('T')[0],
        observations: student.observations || '',
      });
    } else {
      setMode('manual');
      setSelectedStudentId('');
      setFormData({
        name: '',
        groupId: groups[0]?.id || '',
        status: 'Activo',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        observations: '',
      });
    }
  }, [student, groups]);

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setSelectedStudentId(id);

    const selectedStudent = students.find((s) => String(s.id) === String(id));

    if (!selectedStudent) {
      setFormData((prev) => ({
        ...prev,
        name: '',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: selectedStudent.name || '',
      status: selectedStudent.status || 'Activo',
      progress: selectedStudent.progress ?? 0,
      startDate:
        selectedStudent.startDate || new Date().toISOString().split('T')[0],
      observations: selectedStudent.observations || '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      const result = await updateStudent(student.id, formData);

      if (!result?.ok) {
        alert(result?.error || 'No se pudo actualizar el alumno');
        return;
      }

      onClose();
      return;
    }

    if (mode === 'existing') {
      if (!selectedStudentId) {
        alert('Selecciona un alumno de la lista');
        return;
      }

      const selectedStudent = students.find(
        (s) => String(s.id) === String(selectedStudentId)
      );

      if (!selectedStudent) {
        alert('No se encontró el alumno seleccionado');
        return;
      }

      if (!formData.groupId) {
        alert('Selecciona un grupo');
        return;
      }

      const alreadyInGroup = students.some(
        (s) =>
          s.name?.trim().toLowerCase() === selectedStudent.name?.trim().toLowerCase() &&
          String(s.groupId) === String(formData.groupId)
      );

      if (alreadyInGroup) {
        alert('Ese alumno ya está asignado a ese grupo');
        return;
      }

      const result = await addStudent({
        name: selectedStudent.name,
        groupId: formData.groupId,
        status: formData.status || selectedStudent.status || 'Activo',
        progress: formData.progress ?? selectedStudent.progress ?? 0,
        startDate: formData.startDate || selectedStudent.startDate,
        observations: formData.observations || selectedStudent.observations || '',
      });

      if (!result?.ok) {
        alert(result?.error || 'No se pudo añadir el alumno al grupo');
        return;
      }

      onClose();
      return;
    }

    if (!formData.name.trim()) {
      alert('Escribe el nombre del alumno');
      return;
    }

    if (!formData.groupId) {
      alert('Selecciona un grupo');
      return;
    }

    const result = await addStudent(formData);

    if (!result?.ok) {
      alert(result?.error || 'No se pudo crear el alumno');
      return;
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {!isEditing && (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.4rem',
              color: 'var(--text-secondary)',
            }}
          >
            Tipo de alta
          </label>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="radio"
                name="mode"
                value="manual"
                checked={mode === 'manual'}
                onChange={() => setMode('manual')}
              />
              Crear nuevo alumno
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="radio"
                name="mode"
                value="existing"
                checked={mode === 'existing'}
                onChange={() => setMode('existing')}
              />
              Añadir alumno existente
            </label>
          </div>
        </div>
      )}

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.4rem',
            color: 'var(--text-secondary)',
          }}
        >
          Nombre Completo
        </label>

        {isEditing || mode === 'manual' ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej. Ana García"
            required
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <select
            value={selectedStudentId}
            onChange={handleStudentSelect}
            required
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Selecciona un alumno registrado</option>
            {selectableStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.4rem',
              color: 'var(--text-secondary)',
            }}
          >
            Grupo
          </label>
          <select
            name="groupId"
            value={formData.groupId}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Selecciona un grupo</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.4rem',
              color: 'var(--text-secondary)',
            }}
          >
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.4rem',
              color: 'var(--text-secondary)',
            }}
          >
            Progreso (%)
          </label>
          <input
            type="number"
            name="progress"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.4rem',
              color: 'var(--text-secondary)',
            }}
          >
            Fecha de Inicio
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.4rem',
            color: 'var(--text-secondary)',
          }}
        >
          Notas / Observaciones
        </label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          rows={3}
          placeholder="Añade comentarios sobre el desempeño del alumno..."
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            resize: 'vertical',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {isEditing
            ? 'Guardar Cambios'
            : mode === 'existing'
            ? 'Añadir al Grupo'
            : 'Añadir Alumno'}
        </button>
      </div>
    </form>
  );
};