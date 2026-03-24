import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';

export const AttendancePanel = ({ groupId }) => {
  const { students, attendance, markAttendance } = useContext(AppContext);
  const groupStudents = students.filter(s => s.groupId === groupId && s.status === 'Activo');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return record ? record.status : 'No registrado';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Registro de Asistencia</h3>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: 'auto' }} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Alumno</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Estado de Asistencia</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', textAlign: 'right' }}>Acciones rápidas</th>
            </tr>
          </thead>
          <tbody>
            {groupStudents.map(student => {
              const status = getAttendanceStatus(student.id);
              return (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{student.name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <span className={`badge ${status === 'Asiste' ? 'status-activo' : status === 'Falta' ? 'status-inactivo' : 'status-pendiente'}`}>
                       {status}
                     </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: status === 'Asiste' ? 'var(--status-active)' : 'var(--bg-hover)', color: status === 'Asiste' ? 'white' : 'var(--text-primary)' }} onClick={() => markAttendance(student.id, selectedDate, 'Asiste')}>Asiste</button>
                      <button className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: status === 'Falta' ? 'var(--status-inactive)' : 'var(--bg-hover)', color: status === 'Falta' ? 'white' : 'var(--text-primary)' }} onClick={() => markAttendance(student.id, selectedDate, 'Falta')}>Falta</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {groupStudents.length === 0 && (
              <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay alumnos activos en este grupo.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
