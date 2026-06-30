# CLAUDE.md — Plataforma de Calificaciones CUCII

## Stack

- **Angular 20.3.0** — zoneless (`provideZonelessChangeDetection`), standalone components, lazy-loaded routes
- **TailwindCSS 4.2.1** — configurado vía `src/styles.css` con `@import "tailwindcss"`
- **TypeScript 5.9**, **RxJS 7.8**
- Sin NgRx ni librerías de estado externas — estado reactivo con **Angular Signals**
- Backend: Spring Boot, PostgreSQL. API definida en `docs/api-docs.json`

## Convenciones de idioma

- **Código en inglés, datos/contenido en español.** Nombres de clases, métodos, señales, variables, archivos y rutas van en inglés. Labels, placeholders, mensajes van en español.
- **Field names igual que el backend.** No hay mappers — los modelos del frontend usan los mismos nombres que la API (ej. `numeroRvoe`, `duracionCuatrimestres`, `alumnoId`, `nombre`). Los IDs son `number`.

## Roles (rolId mapeado en `auth.model.ts`)

| ID | Rol | Acceso |
|----|-----|--------|
| 1 | `admin` | Total (sidebar completo) |
| 2 | `rector` | Total (sidebar completo) |
| 3 | `docente` | Básico (browse + upload) |
| 4 | `servicios_escolares` | Sin detalle aún |
| 5 | `coordinador` | Sin detalle aún |

`AuthService.isAdmin()` retorna `true` para `admin` y `rector`.

## Autenticación

- Token JWT guardado en cookie `auth_token` (JS-accessible, SameSite=Lax, Secure, 24h)
- `rolId` guardado en cookie `auth_role` para restaurar rol inmediatamente al recargar
- `GET /auth/me` se llama al recargar (vía `setTimeout(0)`) para refrescar datos completos del usuario
- `AuthService` expone señal `_cachedRole` que se hidrata sincrónicamente desde cookie `auth_role` en el constructor. `isAdmin()` usa `currentUser()?.rol ?? _cachedRole()` como fallback, evitando race condition con guards que corren antes de que `/auth/me` resuelva.
- Sin `POST /auth/logout` — el logout del frontend limpia las cookies
- Interceptor HTTP agrega `Authorization: Bearer <token>` y captura 401 → logout + redirect a `/login`

## Modelos (`src/app/core/models/`)

Todos los field names coinciden 1:1 con los DTOs del backend:

```typescript
// auth.model.ts
LoginResponse { id, nombre, apellido, email, rolId, token }
MeResponse    { id, nombre, apellido, email, rolId }
AuthUser      { id, nombre, apellido, email, rolId, rol: UserRole }
UserRole      = 'admin' | 'rector' | 'docente' | 'servicios_escolares' | 'coordinador'

// user.model.ts
User          { id, nombre, apellido, email, rolId, plantelId, isActive }
UsuarioRequest { nombre, apellido, email, password, rolId, plantelId }

// student.model.ts
Student       { id, nombres, primerApellido, segundoApellido?, curp, correoInstitucional, estatusId }
STATUS_MAP    Record<number, { label, classes }> — 1=Invasión (amarillo), 2=Cursando (verde), 3=Egresado (verde brillante), 4=Baja (rojo)

// program.model.ts
Program       { id, nombre, grado, numeroRvoe, fechaRvoe, duracionCuatrimestres, cantidadMaterias, materias: Subject[] }
Subject       { id, clave, nombre, cuatrimestre, creditos }

// group.model.ts
Group         { id, clave, nombre, planEstudioId, plantelId }

// campus.model.ts
Campus        { id, nombreOficial, nombreCorto?, direccionCalle?, direccionNumeroExt?,
                direccionNumeroInt?, colonia?, codigoPostal?, ciudadMunicipio,
                estado, pais?, directorNombre? }

// grade.model.ts
Grade         { id, alumnoId, grupoId, materiaId, calificacion, registradoPor }

// group-student.model.ts
GroupStudent  { id?, groupId, studentId }   // id se usa para DELETE

// teacher-assignment.model.ts
TeacherAssignment { id, userId, groupId, subjectId }
```

## Servicios (`src/app/core/services/`)

Todos usan `HttpClient` con endpoints reales. `signal<T[]>` interno, expuesto como `.asReadonly()`.

Los métodos retornan `Observable<T>` con HTTP real, no `of()` mock.

| Servicio | Endpoints base | Notas |
|---|---|---|
| `AuthService` | `/auth/login`, `/auth/me` | Cookie + signal. `login()` → setea cookies + currentUser. Constructor restaura desde cookies + valida con `/auth/me`. `_cachedRole` fallback desde cookie `auth_role` para guards sincrónicos. |
| `UsersService` | `/usuarios` | CRUD completo. `add`/`update` esperan `UsuarioRequest`. |
| `StudentsService` | `/alumnos` | CRUD completo. `getByCurp()` filtra cliente-side. |
| `GradesService` | `/calificaciones` | `getByStudent(alumnoId)` usa `?alumnoId=`. Sin `addMany` (pendiente batch). |
| `ProgramsService` | `/planes-estudio/con-materias-count` (lista), `/planes-estudio/{id}/con-materias` (detalle) | `loadAll()` usa `con-materias-count` (sin N+1). Subjects se cargan separado vía `getSubjectsByProgram()`. |
| `GroupsService` | `/grupos` | CRUD + `getCuatrimestresCount(id)` → `/grupos/{id}/cuatrimestres` + `getSubjectsByGroupAndTerm(groupId, cuatri)` → `/grupos/{groupId}/cuatrimestres/{cuatri}/materias` |
| `CampusesService` | `/planteles` | CRUD, simple |
| `GroupStudentsService` | `/alumnos-grupos` | Mapea `alumnoId`↔`studentId`, `grupoId`↔`groupId`. DELETE busca `id` en signal. |
| `TeacherAssignmentsService` | `/profesores-grupos` | Mapea `usuarioId`↔`userId`, `grupoId`↔`groupId`, `materiaId`↔`subjectId`. |

## Rutas (`src/app/app.routes.ts`)

| Path | Componente | Guard |
|---|---|---|
| `/` | redirect → `/browse` | — |
| `/login` | `Login` | — |
| `/browse` | `Browse` | `authGuard` |
| `/upload` | `Upload` | `authGuard` |
| `/students` | `Students` | `adminGuard` |
| `/profesores` | `Profesores` | `adminGuard` |
| `/groups` | `Groups` | `adminGuard` |
| `/programs` | `Programs` | `adminGuard` |
| `/subjects` | `Subjects` | `adminGuard` |
| `/campuses` | `Campuses` | `adminGuard` |
| `/users` | `Users` | `adminGuard` |
| `/groups/:id/students` | `GroupStudents` | `adminGuard` |
| `**` | redirect → `/browse` | — |

## Convenciones de código

- Componentes: `inject()` en clase, signals para estado local, `computed()` para derivados
- **No usar `ngOnInit`** — inicialización en constructor o inline
- Forms: `FormBuilder.nonNullable.group({})` siempre
- **Búsqueda en listas**: patrón draft+committed — `filterDraft` (input) + `filterQ` (aplicado en `computed()` vía `search()`)
- **Formularios unificados**: un solo `form` (NO `addForm` + `editForm` separados). Control de modo vía `editingId = signal<number | null>(null)`:
  - `null` = modo creación, `<id>` = modo actualización
  - `startEdit(item)`: setea `editingId`, carga valores en `form` con `setValue()`, muestra el formulario
  - `closeForm()`: limpia `editingId`, resetea `form`, oculta
  - `toggleForm()`: alterna entre abrir/cerrar formulario
  - `submit()`: si `editingId()` → `update()`, si no → `add()`, luego `closeForm()`
- `startEdit()`: usar `?? ''` en todos los valores de `setValue()` para evitar error de `NonNullableFormBuilder` con `undefined`
- `closeForm()` siempre llama `form.reset()` para restaurar defaults del form builder
- Templates: `@if`, `@for`, `@empty`, `@else` (control flow de Angular 17+, no directivas estructurales)
- Inputs sin two-way: `[value]="signal()"` + `(input)="signal.set($any($event.target).value)"`

## Flujo Upload (manual)

1. Buscar alumno → `studentsService.students()` (filtro cliente-side por CURP o nombre)
2. Seleccionar alumno → `groupStudentsService.assignments()` para obtener grupos
3. Seleccionar grupo → `groupsService.getCuatrimestresCount(groupId)` → llena select de cuatrimestres
4. Seleccionar cuatrimestre → `groupsService.getSubjectsByGroupAndTerm(groupId, term)` → llena materias
5. Ingresar calificación → `gradesService.addGrade({ alumnoId, grupoId, materiaId, calificacion, registradoPor })`
6. `registradoPor` = `auth.currentUser()?.id`

## Flujo Browse

- Lista: filtra `studentsService.students()` por CURP y nombre
- Detalle: al seleccionar alumno, obtiene su grupo → `planEstudioId` → `programsService.getSubjectsByProgram()` → cruza con `gradesService.grades()` por `alumnoId`
- Agrupado por `cuatrimestre` de cada `Subject`. Sin `cuatrimestre` en `Grade` — se deriva de la materia.

## Comandos

```bash
ng build --configuration development   # build rápido (~1.2s), sin optimización
ng serve                               # dev server
```
