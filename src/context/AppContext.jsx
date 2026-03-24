import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState('all');

  const mapGroup = (g) => ({
    id: g.id,
    name: g.nombre,
  });

  const mapStudent = (s) => ({
    id: s.id,
    name: s.nombre,
    groupId: s.grupo_id,
    status: s.estado,
    progress: s.progreso,
    observations: s.observaciones,
    startDate: s.fecha_inicio,
  });

  const mapTask = (t, allStudents) => {
    const st = allStudents.find((s) => s.id === t.alumno_id);

    return {
      id: t.id,
      assigneeId: t.alumno_id,
      title: t.titulo,
      description: t.descripcion || '',
      status: t.estado,
      dueDate: t.fecha_entrega,
      groupId: st ? st.groupId : null,
    };
  };

const mapAttendance = (a) => ({
  id: a.id,
  studentId: a.alumno_id,
  date: String(a.fecha).slice(0, 10),
  status: a.estado,
});

  const toStudentDB = (s) => ({
    nombre: s.name,
    grupo_id: s.groupId && String(s.groupId).trim() !== '' ? s.groupId : null,
    estado: s.status || 'Activo',
    progreso: Number(s.progress ?? 0),
    observaciones: s.observations || '',
    fecha_inicio: s.startDate || null,
  });

  const toTaskDB = (t) => ({
    alumno_id: t.assigneeId && String(t.assigneeId).trim() !== '' ? t.assigneeId : null,
    titulo: t.title,
    descripcion: t.description || '',
    estado: t.status || 'Pendiente',
    fecha_entrega: t.dueDate || null,
  });

  const toAttendanceDB = (a) => ({
    alumno_id: a.studentId,
    fecha: a.date,
    estado: a.status,
  });

 const fetchData = useCallback(async () => {
  try {
    setLoading(true);

    const gRes = await supabase
      .from('grupos')
      .select('*')
      .order('nombre', { ascending: true });

    const sRes = await supabase
      .from('alumnos')
      .select('*')
      .order('nombre', { ascending: true });

    const tRes = await supabase
      .from('tareas')
      .select('*');

    const aRes = await supabase
      .from('asistencias')
      .select('*');

    console.log('grupos:', gRes);
    console.log('alumnos:', sRes);
    console.log('tareas:', tRes);
    console.log('asistencias:', aRes);

    if (gRes.error) {
      console.error('Error cargando grupos:', gRes.error);
    }

    if (sRes.error) {
      console.error('Error cargando alumnos:', sRes.error);
    }

    if (tRes.error) {
      console.error('Error cargando tareas:', tRes.error);
    }

    if (aRes.error) {
      console.error('Error cargando asistencias:', aRes.error);
    }

    const loadedGroups = gRes.data ? gRes.data.map(mapGroup) : [];
    const loadedStudents = sRes.data ? sRes.data.map(mapStudent) : [];
    const loadedTasks = tRes.data ? tRes.data.map((t) => mapTask(t, loadedStudents)) : [];
    const loadedAttendance = aRes.data ? aRes.data.map(mapAttendance) : [];

    setGroups(loadedGroups);
    setStudents(loadedStudents);
    setTasks(loadedTasks);
    setAttendance(loadedAttendance);
  } catch (error) {
    console.error('Error general cargando datos desde Supabase:', error);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('gestor-practicas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grupos' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alumnos' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tareas' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'asistencias' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const filteredStudents = useMemo(() => {
    const base =
      selectedGroupId === 'all'
        ? students
        : students.filter(
            (student) => String(student.groupId) === String(selectedGroupId)
          );

    return [...base].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedGroupId]);

  const getStudentsByGroup = useCallback(
    (groupId) => {
      return students
        .filter((student) => String(student.groupId) === String(groupId))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    [students]
  );

  const addGroup = async (group) => {
    try {
      const nombre = typeof group === 'string' ? group.trim() : group?.name?.trim();

      if (!nombre) {
        throw new Error('El nombre del grupo es obligatorio');
      }

      const exists = groups.some(
        (g) => g.name.toLowerCase() === nombre.toLowerCase()
      );

      if (exists) {
        throw new Error('Ya existe un grupo con ese nombre');
      }

      const { data, error } = await supabase
        .from('grupos')
        .insert([{ nombre }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setGroups((prev) => [...prev, mapGroup(data[0])]);
      }

      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error creando grupo:', error);
      return { ok: false, error: error.message || 'No se pudo crear el grupo' };
    }
  };

  const updateGroup = async (id, updated) => {
    try {
      const nombre = updated?.name?.trim();

      if (!nombre) {
        throw new Error('El nombre del grupo es obligatorio');
      }

      const { data, error } = await supabase
        .from('grupos')
        .update({ nombre })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setGroups((prev) =>
          prev.map((g) => (g.id === id ? mapGroup(data[0]) : g))
        );
      }

      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error actualizando grupo:', error);
      return { ok: false, error: error.message || 'No se pudo actualizar el grupo' };
    }
  };

  const deleteGroup = async (id) => {
    try {
      const hasStudents = students.some((s) => String(s.groupId) === String(id));

      if (hasStudents) {
        throw new Error('No se puede eliminar un grupo con alumnos asignados');
      }

      const { error } = await supabase.from('grupos').delete().eq('id', id);

      if (error) throw error;

      setGroups((prev) => prev.filter((g) => g.id !== id));
      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error eliminando grupo:', error);
      return { ok: false, error: error.message || 'No se pudo eliminar el grupo' };
    }
  };

  const addStudent = async (student) => {
    try {
      const payload = toStudentDB(student);

      const { data, error } = await supabase
        .from('alumnos')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setStudents((prev) => [...prev, mapStudent(data[0])]);
      }

      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error insertando alumno en Supabase:', error);
      return { ok: false, error: error.message || 'No se pudo crear el alumno' };
    }
  };

  const updateStudent = async (id, updated) => {
    try {
      const cleanUpdated = { ...updated };
      if (cleanUpdated.id) delete cleanUpdated.id;

      const payload = toStudentDB(cleanUpdated);

      const { data, error } = await supabase
        .from('alumnos')
        .update(payload)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setStudents((prev) =>
          prev.map((s) => (s.id === id ? mapStudent(data[0]) : s))
        );
      }

      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error actualizando alumno:', error);
      return { ok: false, error: error.message || 'No se pudo actualizar el alumno' };
    }
  };

  const deleteStudent = async (id) => {
    try {
      const { error } = await supabase.from('alumnos').delete().eq('id', id);

      if (error) throw error;

      setStudents((prev) => prev.filter((s) => s.id !== id));
      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error eliminando alumno:', error);
      return { ok: false, error: error.message || 'No se pudo eliminar el alumno' };
    }
  };

  const addTask = async (task) => {
    try {
      const payload = toTaskDB(task);

      const { data, error } = await supabase
        .from('tareas')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setTasks((prev) => [...prev, mapTask(data[0], students)]);
      }

      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error creando tarea:', error);
      return { ok: false, error: error.message || 'No se pudo crear la tarea' };
    }
  };

  const updateTask = async (id, updated) => {
    try {
      const cleanUpdated = { ...updated };
      if (cleanUpdated.id) delete cleanUpdated.id;

      const payload = toTaskDB(cleanUpdated);

      const { data, error } = await supabase
        .from('tareas')
        .update(payload)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? mapTask(data[0], students) : t))
        );
      }

      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      return { ok: false, error: error.message || 'No se pudo actualizar la tarea' };
    }
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase.from('tareas').delete().eq('id', id);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== id));
      await fetchData();
      return { ok: true };
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      return { ok: false, error: error.message || 'No se pudo eliminar la tarea' };
    }
  };

const markAttendance = async (studentId, date, status) => {
  try {
    const normalizedStudentId = String(studentId);
    const normalizedDate = String(date).slice(0, 10);

    const existing = attendance.find(
      (a) =>
        String(a.studentId) === normalizedStudentId &&
        String(a.date).slice(0, 10) === normalizedDate
    );

    if (existing) {
      const { data, error } = await supabase
        .from('asistencias')
        .update({ estado: status })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      const updatedAttendance = mapAttendance(data);

      setAttendance((prev) =>
        prev.map((a) =>
          String(a.id) === String(existing.id) ? updatedAttendance : a
        )
      );
    } else {
      const payload = {
        alumno_id: studentId,
        fecha: normalizedDate,
        estado: status,
      };

      const { data, error } = await supabase
        .from('asistencias')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const newAttendance = mapAttendance(data);
      setAttendance((prev) => [...prev, newAttendance]);
    }

    await fetchData();

    return { ok: true };
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    return {
      ok: false,
      error: error.message || 'No se pudo registrar la asistencia',
    };
  }
};
  return (
    <AppContext.Provider
      value={{
        groups,
        addGroup,
        updateGroup,
        deleteGroup,
        students,
        filteredStudents,
        getStudentsByGroup,
        selectedGroupId,
        setSelectedGroupId,
        setStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        attendance,
        markAttendance,
        loading,
        refreshData: fetchData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};