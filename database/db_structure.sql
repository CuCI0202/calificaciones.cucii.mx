-- ─── planteles ───────────────────────────────────────────────────────────────

create table planteles
(
    id                   integer generated always as identity primary key,
    nombre_oficial       varchar(150) not null,
    nombre_corto         varchar(50),
    direccion_calle      varchar(100),
    direccion_numero_ext varchar(20),
    direccion_numero_int varchar(20),
    colonia              varchar(100),
    codigo_postal        varchar(10),
    ciudad_municipio     varchar(100) not null,
    estado               varchar(100) not null,
    pais                 varchar(50)              default 'México',
    latitud              numeric(10, 8),
    longitud             numeric(11, 8),
    director_nombre      varchar(150),
    is_active            boolean                  default true,
    created_at           timestamp with time zone default current_timestamp,
    updated_at           timestamp with time zone default current_timestamp
);

alter table planteles owner to admin_cuci;

create index idx_planteles_ciudad on planteles (ciudad_municipio);
create index idx_planteles_estado on planteles (estado);

-- ─── coordinadores ───────────────────────────────────────────────────────────

create table coordinadores
(
    id                  integer generated always as identity primary key,
    plantel_id          integer      not null,
    nombres             varchar(100) not null,
    apellidos           varchar(100) not null,
    titulo_cortesia     varchar(20),
    email_institucional varchar(150) not null unique,
    email_personal      varchar(150),
    telefono_movil      varchar(20),
    departamento        varchar(100),
    is_active           boolean                  default true,
    created_at          timestamp with time zone default current_timestamp,
    updated_at          timestamp with time zone default current_timestamp,

    constraint fk_coordinador_plantel
        foreign key (plantel_id)
            references planteles (id)
            on update cascade on delete restrict
);

alter table coordinadores owner to admin_cuci;

create index idx_coordinadores_plantel on coordinadores (plantel_id);
create index idx_coordinadores_email   on coordinadores (email_institucional);

-- ─── planes_estudio ──────────────────────────────────────────────────────────

create table planes_estudio
(
    id                     integer generated always as identity primary key,
    nombre                 varchar(120) not null,
    duracion_cuatrimestres integer      not null,
    is_active              boolean                  default true,
    created_at             timestamp with time zone default current_timestamp,
    updated_at             timestamp with time zone default current_timestamp
);

alter table planes_estudio owner to admin_cuci;

-- ─── materias ────────────────────────────────────────────────────────────────

create table materias
(
    id              integer generated always as identity primary key,
    nombre          varchar(120) not null,
    clave           varchar(20),
    creditos        integer,
    cuatrimestre    integer,
    plan_estudio_id integer      not null,
    is_active       boolean                  default true,
    created_at      timestamp with time zone default current_timestamp,
    updated_at      timestamp with time zone default current_timestamp,

    constraint fk_materias_plan_estudio
        foreign key (plan_estudio_id)
            references planes_estudio (id)
            on update cascade on delete restrict
);

alter table materias owner to admin_cuci;

create index idx_materias_plan_estudio on materias (plan_estudio_id);

-- ─── rvoes ───────────────────────────────────────────────────────────────────

create table rvoes
(
    id                         integer generated always as identity primary key,
    plantel_id                 integer     not null,
    numero_rvoe                varchar(50) not null unique,
    plan_estudio_id            integer     not null,
    nivel_educativo            varchar(50) not null,
    modalidad                  varchar(50) not null,
    clave                      varchar(50),
    numero_expediente          varchar(50) not null,
    fecha_expedicion           date        not null,
    vigencia_partir            date        not null,
    fecha_ultima_actualizacion date,
    estatus_administrativo     varchar(50)              default 'Activo',
    is_active                  boolean                  default true,
    created_at                 timestamp with time zone default current_timestamp,
    updated_at                 timestamp with time zone default current_timestamp,

    constraint fk_rvoe_plantel
        foreign key (plantel_id)
            references planteles (id)
            on update cascade on delete restrict,

    constraint fk_rvoe_plan_estudio
        foreign key (plan_estudio_id)
            references planes_estudio (id)
            on update cascade on delete restrict
);

alter table rvoes owner to admin_cuci;

create index idx_rvoes_plantel     on rvoes (plantel_id);
create index idx_rvoes_plan_estudio on rvoes (plan_estudio_id);

-- ─── alumnos ─────────────────────────────────────────────────────────────────

create table alumnos
(
    id                   integer generated always as identity primary key,
    nombres              varchar(80)  not null,
    primer_apellido      varchar(80)  not null,
    segundo_apellido     varchar(80),
    curp                 char(18)     not null unique,
    correo_institucional varchar(120) unique,

    constraint chk_curp_length check (char_length(curp) = 18),
    constraint chk_curp_format check (
        curp ~ '^[A-Z][AEIOUX][A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z][0-9]$'
    )
);

alter table alumnos owner to admin_cuci;

create index idx_alumnos_correo on alumnos (correo_institucional);

-- ─── roles ───────────────────────────────────────────────────────────────────

create table roles
(
    id          integer generated always as identity primary key,
    nombre      varchar(50)  not null unique,
    descripcion varchar(200),
    is_active   boolean                  default true,
    created_at  timestamp with time zone default current_timestamp
);

alter table roles owner to admin_cuci;

insert into roles (nombre, descripcion) values
    ('admin',                   'Administrador del sistema con acceso total'),
    ('rector',                  'Rector del plantel'),
    ('docente',                 'Docente / profesor'),
    ('school services manager', 'Responsable de servicios escolares');

-- ─── usuarios ────────────────────────────────────────────────────────────────

create table usuarios
(
    id            integer generated always as identity primary key,
    nombre        varchar(150) not null,
    email         varchar(150) not null unique,
    password_hash varchar(255) not null,
    rol_id        integer      not null,
    plantel_id    integer,
    is_active     boolean                  default true,
    created_at    timestamp with time zone default current_timestamp,
    updated_at    timestamp with time zone default current_timestamp,

    constraint fk_usuarios_rol
        foreign key (rol_id)
            references roles (id)
            on update cascade on delete restrict,

    constraint fk_usuarios_plantel
        foreign key (plantel_id)
            references planteles (id)
            on update cascade on delete restrict
);

alter table usuarios owner to admin_cuci;

create index idx_usuarios_email   on usuarios (email);
create index idx_usuarios_rol     on usuarios (rol_id);
create index idx_usuarios_plantel on usuarios (plantel_id);

-- ─── grupos ──────────────────────────────────────────────────────────────────

create sequence grupos_numero_seq start 1;

create table grupos
(
    id              integer generated always as identity primary key,
    clave           varchar(20)  not null unique
        default ('CG-' || nextval('grupos_numero_seq')::text),
    nombre          varchar(120) not null,
    plan_estudio_id integer      not null,
    plantel_id      integer      not null,
    is_active       boolean                  default true,
    created_at      timestamp with time zone default current_timestamp,
    updated_at      timestamp with time zone default current_timestamp,

    constraint fk_grupos_plan_estudio
        foreign key (plan_estudio_id)
            references planes_estudio (id)
            on update cascade on delete restrict,

    constraint fk_grupos_plantel
        foreign key (plantel_id)
            references planteles (id)
            on update cascade on delete restrict
);

alter table grupos owner to admin_cuci;

create index idx_grupos_plan_estudio on grupos (plan_estudio_id);
create index idx_grupos_plantel      on grupos (plantel_id);

-- ─── alumnos: agregar referencia al grupo ────────────────────────────────────

alter table alumnos
    add column grupo_id integer,
    add constraint fk_alumnos_grupo
        foreign key (grupo_id)
            references grupos (id)
            on update cascade on delete set null;

create index idx_alumnos_grupo on alumnos (grupo_id);

-- ─── profesores_grupos ────────────────────────────────────────────────────────

create table profesores_grupos
(
    id         integer generated always as identity primary key,
    usuario_id integer not null,
    grupo_id   integer not null,
    is_active  boolean                  default true,
    created_at timestamp with time zone default current_timestamp,

    constraint uq_profesor_grupo unique (usuario_id, grupo_id),

    constraint fk_profesores_grupos_usuario
        foreign key (usuario_id)
            references usuarios (id)
            on update cascade on delete restrict,

    constraint fk_profesores_grupos_grupo
        foreign key (grupo_id)
            references grupos (id)
            on update cascade on delete restrict
);

alter table profesores_grupos owner to admin_cuci;

create index idx_profesores_grupos_usuario on profesores_grupos (usuario_id);
create index idx_profesores_grupos_grupo   on profesores_grupos (grupo_id);

-- =============================================================================
-- DATOS DE PRUEBA
-- Asume DB limpia: los IDs generados arrancan en 1 por tabla.
-- password_hash corresponde a la contraseña 'Test1234!' (bcrypt 10 rondas).
-- =============================================================================

-- ─── planteles (id: 1, 2) ────────────────────────────────────────────────────
insert into planteles (nombre_oficial, nombre_corto, direccion_calle, direccion_numero_ext, colonia, codigo_postal, ciudad_municipio, estado, latitud, longitud, director_nombre)
values
    ('Centro Universitario de Ciencias de la Información', 'CUCI Norte', 'Av. Revolución',      '1234', 'Centro',         '44100', 'Guadalajara', 'Jalisco', 20.65769900, -103.34940000, 'Dr. Arturo Vega Ramírez'),
    ('Centro Universitario de Ciencias de la Información', 'CUCI Sur',   'Calle Independencia', '567',  'Zona Industrial', '45150', 'Tlaquepaque', 'Jalisco', 20.63250000, -103.31870000, 'Mtra. Sofía Delgado Fuentes');

-- ─── coordinadores (id: 1, 2) ────────────────────────────────────────────────
insert into coordinadores (plantel_id, nombres, apellidos, titulo_cortesia, email_institucional, email_personal, telefono_movil, departamento)
values
    (1, 'Roberto',  'Castillo Núñez',   'Lic.',  'rcastillo@cuci.edu.mx', 'rcastillo@gmail.com', '3310001111', 'Coordinación Académica'),
    (2, 'Patricia', 'Ibarra Gutiérrez', 'Mtra.', 'pibarra@cuci.edu.mx',   'pibarra@gmail.com',   '3322223333', 'Coordinación Académica');

-- ─── planes_estudio (id: 1, 2) ───────────────────────────────────────────────
insert into planes_estudio (nombre, duracion_cuatrimestres)
values
    ('Ingeniería en Desarrollo de Software',       12),
    ('Licenciatura en Administración de Empresas', 12);

-- ─── materias (plan 1 → ids 1-4 | plan 2 → ids 5-8) ─────────────────────────
insert into materias (nombre, clave, creditos, cuatrimestre, plan_estudio_id)
values
    ('Fundamentos de Programación', 'FP-101', 8, 1, 1),
    ('Matemáticas Discretas',       'MD-101', 6, 1, 1),
    ('Bases de Datos I',            'BD-201', 8, 2, 1),
    ('Ingeniería de Software',      'IS-301', 8, 3, 1),
    ('Fundamentos de Administración','FA-101',8, 1, 2),
    ('Contabilidad General',        'CG-101', 6, 1, 2),
    ('Mercadotecnia',               'MK-201', 8, 2, 2),
    ('Gestión de Proyectos',        'GP-301', 8, 3, 2);

-- ─── rvoes (id: 1, 2) ────────────────────────────────────────────────────────
insert into rvoes (plantel_id, numero_rvoe, plan_estudio_id, nivel_educativo, modalidad, numero_expediente, fecha_expedicion, vigencia_partir)
values
    (1, 'RVOE-2021-001', 1, 'Licenciatura', 'Escolarizada', 'EXP-2021-0041', '2021-06-15', '2021-09-01'),
    (2, 'RVOE-2022-004', 2, 'Licenciatura', 'Escolarizada', 'EXP-2022-0089', '2022-03-10', '2022-09-01');

-- ─── usuarios (id: 1 admin | 2 rector | 3-4 docentes | 5 servicios) ──────────
-- roles: 1=admin 2=rector 3=docente 4=school services manager
insert into usuarios (nombre, email, password_hash, rol_id, plantel_id)
values
    ('Admin Sistema',        'admin@cuci.edu.mx',    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 1, null),
    ('Dr. Marco Herrera',    'mherrera@cuci.edu.mx', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 2, 1),
    ('Lic. Ana Torres',      'atorres@cuci.edu.mx',  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 3, 1),
    ('Ing. Luis Pérez',      'lperez@cuci.edu.mx',   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 3, 1),
    ('Mtra. Carmen Salinas', 'csalinas@cuci.edu.mx', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 4, 1);

-- ─── grupos (clave generada por secuencia: CGSV-1, CGSV-2, CGSV-3) ──────────
insert into grupos (nombre, plan_estudio_id, plantel_id)
values
    ('IDS-2024A — Primer Cuatrimestre',   1, 1),
    ('IDS-2024B — Segundo Cuatrimestre',  1, 1),
    ('LAE-2024A — Primer Cuatrimestre',   2, 2);

-- ─── alumnos (id: 1-3) ───────────────────────────────────────────────────────
insert into alumnos (nombres, primer_apellido, segundo_apellido, curp, correo_institucional, grupo_id)
values
    ('Juan',   'García',    'López',     'GALJ950320HJCRPNA5', 'jgarcia@alumnos.cuci.edu.mx',   1),
    ('María',  'Rodríguez', 'Hernández', 'ROHM980705MJCDRRB2', 'mrodriguez@alumnos.cuci.edu.mx', 1),
    ('Carlos', 'Mendoza',   'Torres',    'METC001128HJCNRRC4', 'cmendoza@alumnos.cuci.edu.mx',   2);

-- ─── profesores_grupos ───────────────────────────────────────────────────────
-- Ana Torres (usuario 3) imparte en grupos 1 y 2
-- Luis Pérez (usuario 4) imparte en grupo 1
insert into profesores_grupos (usuario_id, grupo_id)
values
    (3, 1),
    (3, 2),
    (4, 1);
