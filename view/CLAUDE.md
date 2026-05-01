# CLAUDE.md — Plataforma de Calificaciones CUCII

## Stack

- **Angular 20.3.0** — zoneless (`provideZonelessChangeDetection`), standalone components, lazy-loaded routes
- **TailwindCSS 4.2.1** — configurado vía `src/styles.css` con `@import "tailwindcss"`
- **TypeScript 5.9**, **RxJS 7.8**
- Sin NgRx ni librerías de estado externas — estado reactivo con **Angular Signals**

## Convención de idioma

**Código en inglés, datos/contenido en español.** Esto incluye: nombres de clases, interfaces, métodos, signals, variables, rutas URL y nombres de archivos/carpetas. El texto visible al usuario (labels, placeholders, mensajes) queda en español.

## Colores de marca (definidos en `src/styles.css`)

```css
--color-primary: #c6070e
--color-primary-dark: #a0050b
--color-primary-light: #fde8e9
--color-brand-dark: #161c2d
```

---

## Modelos de datos (`src/app/core/models/`)

```typescript
// teacher.model.ts
type UserRole = 'teacher' | 'admin';
interface Teacher { id; name; lastName; email; password; role: UserRole; }

// student.model.ts
interface Student { id; curp; name; programId; groupId; campusId; }

// grade.model.ts
interface Grade { id; studentId; studentName; studentCurp; subjectId; subjectName; term: number; score: number; }

// program.model.ts
interface Program { id; name; rvoe; rvoeDate; subjects: Subject[]; }

// subject.model.ts
interface Subject { id; code; name; }   // code es visible (ej. MAT-101), id es interno

// group.model.ts
interface Group { id; code; name; programId; campusId; }

// campus.model.ts
interface Campus { id; name; address; }
```

> **Tipos de ID:** Todos los campos `id` y FK (`programId`, `groupId`, `campusId`, `studentId`, `subjectId`) son `number`. Los `<select>` del HTML devuelven `string`, por lo que se coercen con `+value` al pasar a los servicios.
>
> **Nota clave:** `Subject` tiene tres campos — `id` (interno/BD), `code` (visible, el admin la escribe manualmente, ej. `MAT-101`), `name`.
>
> **curp** y **rvoe** se conservan en minúsculas como acrónimos oficiales mexicanos (sin traducción).

---

## Servicios (`src/app/core/services/`)

Todos usan `signal<T[]>` internamente y exponen `.asReadonly()`. Los métodos retornan `Observable<T>` con `of()` para compatibilidad futura con HTTP.

| Servicio | Signal público | Métodos CRUD |
|---|---|---|
| `AuthService` | `currentUser` | `login`, `logout`, `isAuthenticated`, `isAdmin`, `getRole` |
| `StudentsService` | `students` | `add`, `update`, `delete`, `getById`, `getByCurp`, `getByProgram`, `getByGroup` |
| `GradesService` | `grades` | `addGrade`, `addMany`, `getByStudent` (filtra por `studentCurp`), `getByStudentId` |
| `ProgramsService` | `programs` | `add`, `update`, `delete`, `getById` + sub-CRUD de materias: `addSubject`, `updateSubject(programId, subjectId, changes: Omit<Subject,'id'>)`, `deleteSubject`, `getSubjectsByProgram` |
| `GroupsService` | `groups` | `add`, `update`, `delete`, `getByProgram` |
| `CampusesService` | `campuses` | `add`, `update`, `delete`, `getById` |
| `UsersService` | `users` | `add`, `update`, `delete`, `getById` |

### Firma importante de `ProgramsService`

```typescript
// add: NO pasar subjects, el servicio los inicializa vacíos
add(program: Omit<Program, 'id' | 'subjects'>): Observable<Program>

// updateSubject: tercer parámetro es objeto { code, name }, NO string
updateSubject(programId: number, subjectId: number, changes: Omit<Subject, 'id'>): Observable<Subject | null>
```

---

## Autenticación y roles

- **Un solo login** en `/login` para ambos roles
- `AuthService.isAdmin()` → `true` si `role === 'admin'`
- Tras login: todos van a `/browse`

### Cuentas mock

| Email | Password | Rol |
|---|---|---|
| `admin@cucii.edu.mx` | `1234` | admin |
| `juan@cucii.edu.mx` | `1234` | teacher |
| `maria@cucii.edu.mx` | `1234` | teacher |
| `carlos@cucii.edu.mx` | `1234` | teacher |

### Guards

- `authGuard` — redirige a `/login` si no autenticado
- `adminGuard` — redirige a `/login` si no autenticado; a `/browse` si autenticado pero no admin

---

## Rutas (`src/app/app.routes.ts`)

| Path | Componente | Guard |
|---|---|---|
| `/` | redirect → `/browse` | — |
| `/login` | `Login` | — |
| `/browse` | `Browse` | `authGuard` |
| `/upload` | `Upload` | `authGuard` |
| `/students` | `Students` | `adminGuard` |
| `/groups` | `Groups` | `adminGuard` |
| `/programs` | `Programs` | `adminGuard` |
| `/subjects` | `Subjects` | `adminGuard` |
| `/campuses` | `Campuses` | `adminGuard` |
| `/users` | `Users` | `adminGuard` |
| `**` | redirect → `/browse` | — |

Todos los componentes son **lazy-loaded** con `loadComponent`.

---

## Estructura de pantallas (`src/app/features/`)

### `/browse` — dos vistas en el mismo componente

1. **Lista de alumnos**: filtros CURP, Nombre, Carrera, Grupo. Click en fila → vista detalle.
2. **Detalle de alumno**: muestra 10 bloques (uno por cuatrimestre), cada uno con todas las materias de la carrera del alumno. Calificación existente → número con color; sin calificación → `—`. Botón "← Volver" regresa a la lista.

Lógica de detalle: join en memoria — `grades().filter(g => g.studentId === student.id)`, luego para cada term × subject busca coincidencia.

### `/upload` — dos tabs

- **Manual**: campo de texto libre + botón "Buscar" → abre modal con resultados que coincidan por CURP exacta o nombre parcial. El modal muestra CURP, nombre y grupo de cada alumno con botón "Seleccionar". Al seleccionar se cierra el modal y se habilitan los tres campos del formulario (`term`, `subjectId`, `score`), que permanecen `disabled` hasta entonces. Dropdown de materias viene de `ProgramsService` (subjects de la carrera del alumno seleccionado).
- **CSV**: formato de 4 columnas `alumno_curp,materia_id,cuatrimestre,calificacion`. Valida CURP existente en `StudentsService`. Preview con filas válidas/inválidas antes de confirmar.

### `/subjects` — pantalla de admin

Selector de carrera al tope. Muestra subjects de ese programa. Form de agregar: `code` + `name`. El code lo escribe el admin manualmente (no hay lógica automática). Tabla: Clave | Nombre | Acciones.

### `/students` — pantalla de admin

Form de agregar/editar: Nombre, CURP, Carrera (select), Grupo (select filtrado por carrera seleccionada), Plantel. Tabla: Nombre | CURP | Carrera | Grupo | Plantel | Acciones.

---

## Navbar (`src/app/shared/components/navbar/`)

Orden de links de **izquierda a derecha**:
`Consultar` · `Subir` · `Alumnos` · `Grupos` · `Planteles` · `Materias` · `Carreras` (solo admin) · `Usuarios` (solo admin) · `Cerrar sesión`

---

## Datos mock (IDs numéricos)

### Students
| ID | CURP | name | programId | groupId | campusId |
|---|---|---|---|---|---|
| 1 | `GAMA990101HDFRCR01` | Marco Antonio García Martínez | 1 (ISC) | 1 (ISC-A) | 1 (Centro) |
| 2 | `LOPB010315MDFPZN02` | Brenda López Pérez | 2 (ADE) | 3 (ADE-A) | 1 (Centro) |

### Programs y subjects
- id:1 ISC: subjects id 101–108 (codes MAT-101…MAT-108)
- id:2 ADE: subjects id 201–204 (codes ADE-201…ADE-204)

### Groups
- id:1 ISC-A (programId:1, campusId:1)
- id:2 ISC-B (programId:1, campusId:2)
- id:3 ADE-A (programId:2, campusId:1)

### Campuses
- id:1 Plantel Centro · id:2 Plantel Norte

---

## Convenciones de código

- Componentes: clase TS con `inject()`, signals para estado local, `computed()` para derivados
- **No usar `ngOnInit`** — inicialización en constructor o directamente en la clase
- Forms: `FormBuilder.nonNullable.group({})` siempre
- Filtrado program/group en listas: join en memoria via `Set<id>` sobre el signal correspondiente
- **Búsqueda en listas**: patrón draft+committed — `filterDraft` (enlazado al input) y `filterQ` (aplicado al `computed()`). El filtro solo se ejecuta al llamar `search()` (botón o Enter). Nunca filtrar en automático con `(input)` directo al signal que alimenta el `computed()`.
- Templates: `@if`, `@for`, `@empty` (sintaxis de control flow de Angular 17+, no directivas estructurales)
- Clases CSS condicionales: `[class.nombre]="condicion"` o `[class]="método()"`
- Inputs sin dos-way binding: `[value]="signal()"` + `(input)="signal.set($any($event.target).value)"`

## Base de datos

- Archivo: `structure.sql` en la raíz del proyecto
- Motor: PostgreSQL con `SERIAL PRIMARY KEY` (enteros autoincrementales)
- Tablas: `planteles`, `carreras`, `materias`, `grupos`, `profesores`, `alumnos`, `calificaciones`
- `calificaciones` tiene FK a `profesores` (quién registró) nullable con `ON DELETE SET NULL`
- Constraint único en `calificaciones(alumno_id, materia_id, cuatrimestre)` — no duplicados
- Trigger `set_updated_at()` automático en todas las tablas
- Las passwords deben almacenarse como hash bcrypt, nunca en texto plano

## Comandos útiles

```bash
ng build --configuration development   # build rápido (~1.2s), sin optimización
ng serve                               # dev server
```
