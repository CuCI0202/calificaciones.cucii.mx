-- ============================================================
--  CUCII — Plataforma de Calificaciones
--  Estructura de base de datos PostgreSQL
-- ============================================================

-- ── Tipos enumerados ────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('profesor', 'admin');

-- ── Tablas ──────────────────────────────────────────────────

CREATE TABLE planteles (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  direccion  TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE carreras (
  id          SERIAL       PRIMARY KEY,
  nombre      VARCHAR(200) NOT NULL,
  rvoe        VARCHAR(100) NOT NULL UNIQUE,
  fecha_rvoe  DATE         NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE materias (
  id         SERIAL       PRIMARY KEY,
  carrera_id INTEGER      NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  clave      VARCHAR(20)  NOT NULL,
  nombre     VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (carrera_id, clave)
);

CREATE TABLE grupos (
  id         SERIAL       PRIMARY KEY,
  carrera_id INTEGER      NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
  plantel_id INTEGER      NOT NULL REFERENCES planteles(id) ON DELETE RESTRICT,
  clave      VARCHAR(20)  NOT NULL UNIQUE,
  nombre     VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE profesores (
  id         SERIAL       PRIMARY KEY,
  nombre     VARCHAR(200) NOT NULL,
  email      VARCHAR(200) NOT NULL UNIQUE,
  password   TEXT         NOT NULL,  -- almacenar hash bcrypt, nunca texto plano
  role       user_role    NOT NULL DEFAULT 'profesor',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE alumnos (
  id         SERIAL      PRIMARY KEY,
  curp       CHAR(18)    NOT NULL UNIQUE,
  nombre     VARCHAR(200) NOT NULL,
  carrera_id INTEGER     NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
  grupo_id   INTEGER     NOT NULL REFERENCES grupos(id)   ON DELETE RESTRICT,
  plantel_id INTEGER     NOT NULL REFERENCES planteles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calificaciones (
  id           SERIAL      PRIMARY KEY,
  alumno_id    INTEGER     NOT NULL REFERENCES alumnos(id)  ON DELETE CASCADE,
  materia_id   INTEGER     NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
  cuatrimestre SMALLINT    NOT NULL CHECK (cuatrimestre BETWEEN 1 AND 10),
  calificacion NUMERIC(5,2) NOT NULL CHECK (calificacion BETWEEN 0 AND 100),
  registrado_por INTEGER   REFERENCES profesores(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alumno_id, materia_id, cuatrimestre)
);

-- ── Índices ─────────────────────────────────────────────────

CREATE INDEX idx_materias_carrera     ON materias(carrera_id);
CREATE INDEX idx_grupos_carrera       ON grupos(carrera_id);
CREATE INDEX idx_grupos_plantel       ON grupos(plantel_id);
CREATE INDEX idx_alumnos_curp         ON alumnos(curp);
CREATE INDEX idx_alumnos_carrera      ON alumnos(carrera_id);
CREATE INDEX idx_alumnos_grupo        ON alumnos(grupo_id);
CREATE INDEX idx_calificaciones_alumno ON calificaciones(alumno_id);
CREATE INDEX idx_calificaciones_materia ON calificaciones(materia_id);

-- ── Función auxiliar para updated_at automático ─────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_planteles_updated_at   BEFORE UPDATE ON planteles   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_carreras_updated_at    BEFORE UPDATE ON carreras    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_materias_updated_at    BEFORE UPDATE ON materias    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_grupos_updated_at      BEFORE UPDATE ON grupos      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profesores_updated_at  BEFORE UPDATE ON profesores  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_alumnos_updated_at     BEFORE UPDATE ON alumnos     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_calificaciones_updated_at BEFORE UPDATE ON calificaciones FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Datos de ejemplo (equivalentes al mock del frontend) ────

INSERT INTO planteles (nombre, direccion) VALUES
  ('Plantel Centro', 'Av. Principal 100, CDMX'),
  ('Plantel Norte',  'Blvd. Norte 250, CDMX');

INSERT INTO carreras (nombre, rvoe, fecha_rvoe) VALUES
  ('Ingeniería en Sistemas Computacionales', 'RVOE-ISC-2020', '2020-09-01'),
  ('Administración de Empresas',             'RVOE-ADE-2019', '2019-01-15');

INSERT INTO materias (carrera_id, clave, nombre) VALUES
  (1, 'MAT-101', 'Matemáticas I'),
  (1, 'MAT-102', 'Comunicación Oral y Escrita'),
  (1, 'MAT-103', 'Introducción a la Programación'),
  (1, 'MAT-104', 'Matemáticas II'),
  (1, 'MAT-105', 'Programación Orientada a Objetos'),
  (1, 'MAT-106', 'Base de Datos I'),
  (1, 'MAT-107', 'Estructuras de Datos'),
  (1, 'MAT-108', 'Desarrollo Web I'),
  (2, 'ADE-201', 'Fundamentos de Administración'),
  (2, 'ADE-202', 'Contabilidad General'),
  (2, 'ADE-203', 'Mercadotecnia I'),
  (2, 'ADE-204', 'Recursos Humanos');

INSERT INTO grupos (carrera_id, plantel_id, clave, nombre) VALUES
  (1, 1, 'ISC-A', 'Grupo A - Sistemas'),
  (1, 2, 'ISC-B', 'Grupo B - Sistemas'),
  (2, 1, 'ADE-A', 'Grupo A - Administración');

-- IMPORTANTE: en producción usar hashes bcrypt, no texto plano
INSERT INTO profesores (nombre, email, password, role) VALUES
  ('Admin Servicios Escolares', 'admin@cucii.edu.mx', 'HASH_AQUI', 'admin'),
  ('Juan García',               'juan@cucii.edu.mx',  'HASH_AQUI', 'profesor'),
  ('María López',               'maria@cucii.edu.mx', 'HASH_AQUI', 'profesor'),
  ('Carlos Ruiz',               'carlos@cucii.edu.mx','HASH_AQUI', 'profesor');

INSERT INTO alumnos (curp, nombre, carrera_id, grupo_id, plantel_id) VALUES
  ('GAMA990101HDFRCR01', 'Marco Antonio García Martínez', 1, 1, 1),
  ('LOPB010315MDFPZN02', 'Brenda López Pérez',            2, 3, 1);

INSERT INTO calificaciones (alumno_id, materia_id, cuatrimestre, calificacion, registrado_por) VALUES
  (1, 1, 1, 88.00, 2),
  (1, 2, 1, 92.00, 2),
  (1, 3, 1, 95.00, 2),
  (2, 9, 2, 78.00, 3),
  (2, 10, 2, 85.00, 3);
