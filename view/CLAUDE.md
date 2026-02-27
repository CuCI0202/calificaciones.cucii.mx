# CLAUDE.md — Plataforma de Calificaciones CUCII

## Stack

- **Angular 20.3.0** — zoneless (`provideZonelessChangeDetection`), standalone components, lazy-loaded routes
- **TailwindCSS 4.2.1** — configurado vía `src/styles.css` con `@import "tailwindcss"`
- **TypeScript 5.9**, **RxJS 7.8**
- Sin NgRx ni librerías de estado externas — estado reactivo con **Angular Signals**

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
// profesor.model.ts
type UserRole = 'profesor' | 'admin';
interface Profesor { id; nombre; email; password; role: UserRole; }

// alumno.model.ts
interface Alumno { id; curp; nombre; carreraId; grupoId; plantelId; }

// calificacion.model.ts
interface Calificacion { id; alumnoId; alumnoNombre; alumnoCurp; materiaId; materiaNombre; cuatrimestre: number; calificacion: number; }

// carrera.model.ts
interface Carrera { id; nombre; rvoe; fechaRvoe; materias: Materia[]; }

// materia.model.ts
interface Materia { id; clave; nombre; }   // clave es visible (ej. MAT-101), id es interno

// grupo.model.ts
interface Grupo { id; clave; nombre; carreraId; plantelId; }

// plantel.model.ts
interface Plantel { id; nombre; direccion; }
```

> **Tipos de ID:** Todos los campos `id` y FK (`carreraId`, `grupoId`, `plantelId`, `alumnoId`, `materiaId`) son `number`. Los `<select>` del HTML devuelven `string`, por lo que se coercen con `+value` al pasar a los servicios.
>
> **Nota clave:** `Materia` tiene tres campos — `id` (interno/BD), `clave` (visible, el admin la escribe manualmente, ej. `MAT-101`), `nombre`.

---

## Servicios (`src/app/core/services/`)

Todos usan `signal<T[]>` internamente y exponen `.asReadonly()`. Los métodos retornan `Observable<T>` con `of()` para compatibilidad futura con HTTP.

| Servicio | Signal público | Métodos CRUD |
|---|---|---|
| `AuthService` | `currentUser` | `login`, `logout`, `isAuthenticated`, `isAdmin`, `getRole` |
| `AlumnosService` | `alumnos` | `add`, `update`, `delete`, `getById`, `getByCurp`, `getByCarrera`, `getByGrupo` |
| `CalificacionesService` | `calificaciones` | `addCalificacion`, `addMany`, `getByAlumno` (filtra por `alumnoCurp`), `getByAlumnoId` |
| `CarrerasService` | `carreras` | `add`, `update`, `delete`, `getById` + sub-CRUD de materias: `addMateria`, `updateMateria(carreraId, materiaId, changes: Omit<Materia,'id'>)`, `deleteMateria` |
| `GruposService` | `grupos` | `add`, `update`, `delete`, `getByCarrera` |
| `PlantelesService` | `planteles` | `add`, `update`, `delete`, `getById` |

### Firma importante de `CarrerasService`

```typescript
// add: NO pasar materias, el servicio las inicializa vacías
add(carrera: Omit<Carrera, 'id' | 'materias'>): Observable<Carrera>

// updateMateria: tercer parámetro es objeto { clave, nombre }, NO string
updateMateria(carreraId: number, materiaId: number, changes: Omit<Materia, 'id'>): Observable<Materia | null>
```

---

## Autenticación y roles

- **Un solo login** en `/login` para ambos roles
- `AuthService.isAdmin()` → `true` si `role === 'admin'`
- Tras login: todos van a `/consultar`

### Cuentas mock

| Email | Password | Rol |
|---|---|---|
| `admin@cucii.edu.mx` | `1234` | admin |
| `juan@cucii.edu.mx` | `1234` | profesor |
| `maria@cucii.edu.mx` | `1234` | profesor |
| `carlos@cucii.edu.mx` | `1234` | profesor |

### Guards

- `authGuard` — redirige a `/login` si no autenticado
- `adminGuard` — redirige a `/login` si no autenticado; a `/consultar` si autenticado pero no admin

---

## Rutas (`src/app/app.routes.ts`)

| Path | Componente | Guard |
|---|---|---|
| `/` | redirect → `/consultar` | — |
| `/login` | `Login` | — |
| `/consultar` | `Consultar` | `authGuard` |
| `/subir` | `Subir` | `authGuard` |
| `/alumnos` | `Alumnos` | `adminGuard` |
| `/grupos` | `Grupos` | `adminGuard` |
| `/carreras` | `Carreras` | `adminGuard` |
| `/materias` | `Materias` | `adminGuard` |
| `/planteles` | `Planteles` | `adminGuard` |
| `**` | redirect → `/consultar` | — |

Todos los componentes son **lazy-loaded** con `loadComponent`.

---

## Estructura de pantallas (`src/app/features/`)

### `/consultar` — dos vistas en el mismo componente

1. **Lista de alumnos**: filtros CURP, Nombre, Carrera, Grupo. Click en fila → vista detalle.
2. **Detalle de alumno**: muestra 10 bloques (uno por cuatrimestre), cada uno con todas las materias de la carrera del alumno. Calificación existente → número con color; sin calificación → `—`. Botón "← Volver" regresa a la lista.

Lógica de detalle: join en memoria — `calificaciones().filter(c => c.alumnoId === alumno.id)`, luego para cada cuatrimestre × materia busca coincidencia.

### `/subir` — dos tabs

- **Manual**: campo CURP + botón "Buscar" → resuelve alumno desde `AlumnosService`. Una vez encontrado, dropdown de materias viene de `CarrerasService` (materias de la carrera del alumno). Form: `cuatrimestre` (1–10), `materiaId`, `calificacion` (0–100).
- **CSV**: formato de 4 columnas `alumno_curp,materia_id,cuatrimestre,calificacion`. Valida CURP existente en `AlumnosService`. Preview con filas válidas/inválidas antes de confirmar.

### `/materias` — pantalla de admin

Selector de carrera al tope. Muestra materias de esa carrera. Form de agregar: `clave` + `nombre`. La clave la escribe el admin manualmente (no hay lógica automática). Tabla: Clave | Nombre | Acciones.

### `/alumnos` — pantalla de admin

Form de agregar/editar: Nombre, CURP, Carrera (select), Grupo (select filtrado por carrera seleccionada), Plantel. Tabla: Nombre | CURP | Carrera | Grupo | Plantel | Acciones.

---

## Navbar (`src/app/shared/components/navbar/`)

Orden de links de **izquierda a derecha**:
`Consultar` · `Subir` · `Alumnos` · `Grupos` · `Planteles` · `Materias` · `Carreras` (solo admin) · `Cerrar sesión`

---

## Datos mock (IDs numéricos)

### Alumnos
| ID | CURP | Nombre | carreraId | grupoId | plantelId |
|---|---|---|---|---|---|
| 1 | `GAMA990101HDFRCR01` | Marco Antonio García Martínez | 1 (ISC) | 1 (ISC-A) | 1 (Centro) |
| 2 | `LOPB010315MDFPZN02` | Brenda López Pérez | 2 (ADE) | 3 (ADE-A) | 1 (Centro) |

### Carreras y materias
- id:1 ISC: materias id 1–8 (claves MAT-101…MAT-108)
- id:2 ADE: materias id 9–12 (claves ADE-201…ADE-204)

### Grupos
- id:1 ISC-A (carreraId:1, plantelId:1)
- id:2 ISC-B (carreraId:1, plantelId:2)
- id:3 ADE-A (carreraId:2, plantelId:1)

### Planteles
- id:1 Plantel Centro · id:2 Plantel Norte

---

## Convenciones de código

- Componentes: clase TS con `inject()`, signals para estado local, `computed()` para derivados
- **No usar `ngOnInit`** — inicialización en constructor o directamente en la clase
- Forms: `FormBuilder.nonNullable.group({})` siempre
- Filtrado carrera/grupo en listas: join en memoria via `Set<id>` sobre el signal correspondiente
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
