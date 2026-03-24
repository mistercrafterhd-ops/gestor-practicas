-- Bloque SQL para crear las tablas en Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla grupos
CREATE TABLE IF NOT EXISTS grupos (
    id uuid primary key default gen_random_uuid(),
    nombre text not null unique,
    created_at timestamp with time zone default now()
);

-- Tabla alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    grupo_id uuid references grupos(id) on delete set null,
    estado text default 'Activo',
    progreso integer default 0,
    observaciones text,
    fecha_inicio date,
    created_at timestamp with time zone default now()
);

-- Tabla tareas
CREATE TABLE IF NOT EXISTS tareas (
    id uuid primary key default gen_random_uuid(),
    alumno_id uuid references alumnos(id) on delete cascade,
    titulo text not null,
    descripcion text,
    estado text default 'Pendiente',
    fecha_entrega date,
    created_at timestamp with time zone default now()
);

-- Tabla asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id uuid primary key default gen_random_uuid(),
    alumno_id uuid references alumnos(id) on delete cascade,
    fecha date not null,
    estado text not null,
    created_at timestamp with time zone default now()
);

-- Inserts iniciales para la tabla grupos
INSERT INTO grupos (nombre) VALUES
    ('Vertices'),
    ('Chollones'),
    ('Dosier'),
    ('Guias'),
    ('Onlybeauty'),
    ('Plugins')
ON CONFLICT (nombre) DO NOTHING;
