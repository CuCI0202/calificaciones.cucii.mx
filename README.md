# calificaciones.cucii.mx

Plataforma institucional de gestión de calificaciones para el **Centro Universitario de Ciencias de la Información (CUCII)**. Permite registrar alumnos, grupos, planes de estudio, materias y calificaciones, con control de acceso basado en roles.

---

## Estructura del repositorio

```
calificaciones.cucii.mx/
├── database/               # Esquema SQL y documentación de la BD
│   ├── db_structure.sql    # Definición completa de tablas + datos de prueba
│   ├── docker-compose.yaml # Contenedor PostgreSQL
│   └── dbdoc/              # Documentación generada por tbls
├── server/                 # API REST — Spring Boot (Java 21)
└── view/                   # SPA — Angular 20
```

---

## Stack

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 18 (Docker) |
| Backend | Spring Boot 4.0.6 · Spring Data JDBC · Spring Security 7 · JWT (JJWT 0.12.6) · Lombok |
| Frontend | Angular 20.3 · TailwindCSS 4.2 · RxJS 7.8 · TypeScript 5.9 |
| Build | Maven (mvnw) · pnpm |

---

## Requisitos previos

- Docker
- Java 21
- Node.js 20+ y pnpm

---

## Levantando el proyecto

### 1. Base de datos

```bash
cd database
docker compose up -d
```

El contenedor `cucii-ss-platform` arranca PostgreSQL en el puerto `5432`. Al iniciar por primera vez ejecuta `db_structure.sql` automáticamente, creando todas las tablas e insertando datos de prueba.

| Parámetro | Valor |
|---|---|
| Host | `localhost:5432` |
| Base de datos | `ss-platform` |
| Usuario | `ssant0` |
| Contraseña | `2004` |

### 2. Backend

```bash
cd server
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

Otros comandos útiles:

```bash
./mvnw test                       # todos los tests
./mvnw test -Dtest=NombreTest     # un solo test
./mvnw package -DskipTests        # genera el JAR
```

### 3. Frontend

```bash
cd view
pnpm install
pnpm start                        # dev server en http://localhost:4200
```

```bash
ng build --configuration development   # build rápido (~1.2 s)
ng build                               # build de producción
```

---

## API

Base URL: `http://localhost:8080`

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Retorna JWT |

El token debe enviarse en las peticiones protegidas como header `Authorization: Bearer <token>`.

### Usuarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/usuarios` | Público | Lista todos |
| GET | `/usuarios/{id}` | Público | Obtiene por ID |
| POST | `/usuarios` | Público | Crea usuario |
| PUT | `/usuarios/{id}` | Público | Actualiza usuario |
| DELETE | `/usuarios/{id}` | Público | Elimina o desactiva (`?deactivate=true`) |

### Planes de estudio

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/planes-estudio` | JWT válido | Lista todos |
| GET | `/planes-estudio/{id}` | JWT válido | Obtiene por ID |
| POST | `/planes-estudio` | Solo `admin` | Crea plan |
| PUT | `/planes-estudio/{id}` | Solo `admin` | Actualiza plan |
| DELETE | `/planes-estudio/{id}` | Solo `admin` | Soft-delete (cascade a materias) |

### Materias

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/materias` | JWT válido | Lista todas |
| GET | `/materias/{id}` | JWT válido | Obtiene por ID |
| POST | `/materias` | Solo `admin` | Crea materia |
| PUT | `/materias/{id}` | Solo `admin` | Actualiza materia |
| DELETE | `/materias/{id}` | Solo `admin` | Soft-delete |

---

## Roles

| Rol | Descripción |
|---|---|
| `admin` | Acceso total al sistema |
| `rector` | Rector del plantel |
| `docente` | Profesor — puede registrar calificaciones |
| `servicios_escolares` | Responsable de servicios escolares |
| `coordinador` | Gestión de grupos y alumnos |

---

## Base de datos

El esquema completo está en `database/db_structure.sql`. Tablas principales:

| Tabla | Descripción |
|---|---|
| `planteles` | Sedes físicas de la institución |
| `planes_estudio` | Carreras (Licenciatura, Maestría, Doctorado) con RVOE |
| `materias` | Materias vinculadas a un plan de estudio |
| `alumnos` | Estudiantes con CURP único |
| `grupos` | Grupos por plan de estudio y plantel |
| `alumnos_grupos` | Relación alumno ↔ grupo |
| `roles` | Catálogo de roles del sistema |
| `usuarios` | Personal con rol asignado y plantel opcional |
| `profesores_grupos` | Asignación profesor ↔ grupo ↔ materia |

La documentación visual (diagramas ER, listado de columnas) está generada con [tbls](https://github.com/k1LoW/tbls) en `database/dbdoc/`.

Para regenerar la documentación después de cambios en el esquema:

```bash
tbls doc
```

---

## Pantallas del frontend

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión |
| `/browse` | Autenticado | Consulta de alumnos y calificaciones por cuatrimestre |
| `/upload` | Autenticado | Registro manual o por CSV de calificaciones |
| `/students` | Admin | CRUD de alumnos |
| `/groups` | Admin | CRUD de grupos |
| `/programs` | Admin | CRUD de planes de estudio |
| `/subjects` | Admin | CRUD de materias por plan |
| `/campuses` | Admin | CRUD de planteles |
| `/users` | Admin | CRUD de usuarios del sistema |