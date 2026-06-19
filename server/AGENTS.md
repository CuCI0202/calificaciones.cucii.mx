# AGENTS.md — Plataforma de Calificaciones CUCII (server)

## Stack

- **Spring Boot 4.0.6** — Java 21, Maven (mvnw wrapper), devtools
- **JdbcTemplate + RowMapper** — SQL explícito en repositorios. NO Spring Data JDBC, no JPA, no lazy loading.
- **Spring Security 7** — stateless JWT, `SecurityFilterChain` con lambda DSL
- **PostgreSQL 18** via Docker (`database/docker-compose.yaml`)
- **Lombok** — `@RequiredArgsConstructor` es el patrón de inyección estándar (los LSP errors sobre "blank final field" son falsos positivos del LSP con Lombok)
- **JJWT 0.12.6** — HS256, firma con `Keys.hmacShaKeyFor`

## Convención de idioma

**Código en inglés, texto visible al usuario en español.** Nombres de clases, métodos, campos, rutas URL, archivos. Mensajes de error HTTP en español. `curp` y `rvoe` son acrónimos oficiales mexicanos, se conservan en minúsculas sin traducción.

## Comandos

| Comando | Descripción |
|---------|-------------|
| `./mvnw spring-boot:run` | Arranca servidor en :8080 |
| `./mvnw test` | Todos los tests |
| `./mvnw test -Dtest=NombreTest` | Test específico |
| `./mvnw package -DskipTests` | Genera JAR |

## Arquitectura en capas

```
Controller (HTTP)
    ↓ llama
Service (lógica de negocio, mapeo a DTOs)
    ↓ llama
Repository (JdbcTemplate, SQL explícito)
    ↓
PostgreSQL
```

```
mx.cucii.school.platform/
├── config/        SecurityConfig — SecurityFilterChain, CORS, PasswordEncoder, AuthenticationManager
├── controller/    @RestController — solo delegan al service
├── dto/           Records request/response (nunca se expone el model directamente)
├── exception/     ResourceNotFoundException, GlobalExceptionHandler (@RestControllerAdvice)
├── model/         Java records con @Table, @Id, @Column (redundantes para JdbcTemplate, se mantienen como documentación)
├── repository/    Clases @Repository con JdbcTemplate + RowMapper; sufijo *JdbcRepository
├── security/      JwtAuthenticationFilter (OncePerRequestFilter)
└── service/       Lógica de negocio; write methods son @Transactional. Timestamps se asignan aquí, no en la BD.
```

### Controller (@RestController)
- **Única responsabilidad:** manejar tráfico HTTP (GET, POST, PUT, DELETE).
- Recibe el request, valida formato (DTO), delega al Service, empaqueta respuesta con `ResponseEntity`.
- **Cero lógica de negocio, cero SQL, cero acceso a BD.**

### Service (@Service)
- **Única responsabilidad:** lógica de negocio y orquestación.
- Valida reglas (permisos, duplicados, rangos), asigna timestamps (`OffsetDateTime.now()`).
- Coordina operaciones entre múltiples repositorios (ej. cascade soft-delete: materias → plan).
- Mapea model records → DTOs de respuesta.
- **Cero SQL. No sabe qué base de datos hay detrás.**
- Métodos write están anotados con `@Transactional`.

### Repository (@Repository)
- **Única responsabilidad:** hablar con la base de datos.
- Recibe/retorna model records (`PlanEstudio`, `Materia`, `Usuario`, `Rol`).
- Usa `JdbcTemplate` con `RowMapper` para transformar filas SQL en records Java.
- SQL explícito en todas las operaciones.
- **Nombres:** `*JdbcRepository` (ej. `PlanEstudioJdbcRepository`, `UsuarioJdbcRepository`).
- **Cero lógica de negocio.** El repository no decide si una operación es válida, solo ejecuta la query.

### Model
- Java records inmutables.
- Anotaciones `@Table`, `@Id`, `@Column` heredadas de Spring Data JDBC — son redundantes con JdbcTemplate pero se mantienen como documentación de la estructura de la tabla.
- **IDs generados con `GENERATED ALWAYS AS IDENTITY`** — al insertar desde Java el campo `id` debe ser `null`.

## Patrón estándar de repositorio JdbcTemplate

```java
@Repository
public class EntidadJdbcRepository {

    private static final RowMapper<Entidad> MAPPER = (rs, rowNum) ->
        new Entidad(
                rs.getInt("id"),
                rs.getString("campo"),
                ...
        );

    private final JdbcTemplate jdbcTemplate;

    // Constructor (Spring injecta JdbcTemplate automáticamente)

    public List<Entidad> findAll() {
        return jdbcTemplate.query("SELECT * FROM tabla", MAPPER);
    }

    public Optional<Entidad> findById(Integer id) {
        return jdbcTemplate.query("SELECT * FROM tabla WHERE id = ?", MAPPER, id)
                .stream().findFirst();
    }

    public boolean existsById(Integer id) {
        return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tabla WHERE id = ?", Integer.class, id
        ) > 0;
    }

    public Entidad save(Entidad entity) {
        if (entity.id() == null) {
            return jdbcTemplate.queryForObject(
                "INSERT INTO tabla (col1, col2, ...) VALUES (?, ?, ...) RETURNING *",
                MAPPER, entity.col1(), entity.col2(), ...
            );
        }
        return jdbcTemplate.queryForObject(
            "UPDATE tabla SET col1 = ?, col2 = ?, ... WHERE id = ? RETURNING *",
            MAPPER, entity.col1(), entity.col2(), ..., entity.id()
        );
    }

    public void softDeleteById(Integer id, OffsetDateTime now) {
        jdbcTemplate.update(
            "UPDATE tabla SET is_active = false, updated_at = ? WHERE id = ?", now, id
        );
    }
}
```

### Soft delete
- **SQL directo:** `UPDATE tabla SET is_active = false, updated_at = ? WHERE id = ?`
- **Cascade soft-delete:** padre e hijos se desactivan en la misma `@Transactional` con dos `UPDATE` consecutivos.
- Ya no se carga el record en memoria, se reconstruye y se guarda de nuevo — se hace un solo `UPDATE`.

### Campos notables en la BD

| Tabla | Columna | Tipo | Java | Nota |
|-------|---------|------|------|------|
| `usuarios` | `apellido` | `varchar(100)` | `String apellido` | Nullable. Incluido en model, request y response. |

## Endpoints

### Planes de estudio (`/planes-estudio`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/planes-estudio` | Listar todos |
| GET | `/planes-estudio/{id}` | Obtener por ID |
| GET | `/planes-estudio/{id}/con-materias` | Plan + materias activas (LEFT JOIN) |
| GET | `/planes-estudio/{id}/con-materias-sql` | Ídem (alias) |
| POST | `/planes-estudio` | Crear (201) |
| PUT | `/planes-estudio/{id}` | Actualizar |
| DELETE | `/planes-estudio/{id}` | Soft-delete + cascade a materias hijas (204) |

### Materias (`/materias`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/materias` | Listar todas |
| GET | `/materias/{id}` | Obtener por ID |
| POST | `/materias` | Crear (201) |
| PUT | `/materias/{id}` | Actualizar |
| DELETE | `/materias/{id}` | Soft-delete (204) |

### Usuarios (`/usuarios`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/usuarios` | Listar todos (solo ADMIN) |
| GET | `/usuarios/{id}` | Obtener por ID |
| POST | `/usuarios` | Crear (201) |
| PUT | `/usuarios/{id}` | Actualizar |
| DELETE | `/usuarios/{id}?deactivate=true|false` | Soft-delete (true) o hard-delete (false) |

### Auth (`/auth`)

| Método | Ruta | Acción |
|--------|------|--------|
| POST | `/auth/login` | Login, devuelve JWT |

## Seguridad y JWT

- `JwtAuthenticationFilter` extiende `OncePerRequestFilter`. Procesa el header `Authorization: Bearer <token>`.
- **No tiene `shouldNotFilter`** (no se excluye `/auth/**` del filtro JWT). Si hay un token expirado en el header al hacer login, `jwtService.extractEmail()` lanza `ExpiredJwtException` y da 403 — el login nunca llega al controller.
- Roles en DB: `admin`, `rector`, `docente`, `servicios_escolares`, `coordinador`. Spring Security usa `.hasRole("ADMIN")` (añade prefijo `ROLE_` automáticamente).
- Token JWT incluye `rol` como claim (minúsculas, sin prefijo).
- `UsuarioDetailsService.loadUserByUsername(email)` se ejecuta en **cada request autenticado** (lo llama `JwtAuthenticationFilter`). Es la consulta más frecuente a la BD.

### CORS
- Origen: `http://localhost:4200`, métodos: GET/POST/PUT/DELETE/OPTIONS, `allowCredentials = true`

## Manejo de errores

- `ResourceNotFoundException` → 404 | `IllegalArgumentException` → 400 | `BadCredentialsException`/`UsernameNotFoundException` → 401
- Todo centralizado en `GlobalExceptionHandler`; controllers no hacen try/catch.

## Respuestas HTTP

- POST → 201 Created con body | DELETE → 204 No Content sin body | GET/PUT → 200 OK con body

## Base de datos

- Puerto 5432, usuario `ssant0`, DB `ss-platform`, password `2004`
- Esquema completo: `../database/db_structure.sql`
- Seed data con passwords bcrypt en `application.properties`. **La contraseña de prueba es `Test1234!`** (no `1234` como aparece en los mocks del frontend).
- Email del admin: `admin@cuci.edu.mx`

## Config (`src/main/resources/application.properties`)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ss-platform
security.jwt.secret=cucii-platform-super-secret-key-change-in-production-2024
security.jwt.expiration=8640000000   # 100 días (dev)
```

## Rutas actuales en SecurityConfig

| Patrón | Acceso |
|--------|--------|
| `/auth/**` | público |
| `/usuarios/**` | `ADMIN` |
| `/planes-estudio/**` | `ADMIN` |
| `/materias/**` | `ADMIN` |
| cualquier otra | JWT válido |

## Rama de migración JdbcTemplate

Toda la migración de Spring Data JDBC → JdbcTemplate se realizó en la rama `refactor/jdbctemplate` con feature branches individuales:

| Rama | Scope |
|------|-------|
| `jdbc-plan-estudio` | PlanEstudioJdbcRepository + PlanEstudioService |
| `jdbc-materia` | MateriaJdbcRepository + MateriaService |
| `jdbc-usuario` | UsuarioJdbcRepository + RolJdbcRepository + UsuarioService |
| `jdbc-auth` | AuthService + UsuarioDetailsService migrados a los nuevos repos |

Convención para futuras migraciones: `jdbc-{entidad}`.
