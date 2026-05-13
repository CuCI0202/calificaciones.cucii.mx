# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Spring Boot 4.0.6** — Java 21, Maven
- **Spring Data JDBC** (not JPA) — no lazy loading, no entity manager, no `@ManyToOne`
- **Spring Security 7** — stateless JWT, `SecurityFilterChain` lambda DSL
- **PostgreSQL** via Docker, puerto 5432, usuario `ssant0`, base de datos `ss-platform`
- **Lombok** — `@RequiredArgsConstructor` es el patrón de inyección estándar
- **JJWT 0.12.6** — HS256, firma con `Keys.hmacShaKeyFor`

## Comandos

```bash
# Desde /server
./mvnw spring-boot:run          # arranca el servidor en :8080
./mvnw test                     # corre todos los tests
./mvnw test -Dtest=NombreTest   # corre un solo test
./mvnw package -DskipTests      # genera el JAR sin correr tests
./mvnw dependency:resolve       # descarga dependencias sin compilar
```

## Arquitectura MVC

```
platform/
├── config/        SecurityConfig — define SecurityFilterChain, PasswordEncoder, AuthenticationManager
├── controller/    @RestController por entidad; solo delegan al service, sin lógica
├── dto/           Records de request/response (nunca se expone el model directamente)
├── exception/     ResourceNotFoundException, GlobalExceptionHandler (@RestControllerAdvice)
├── model/         Entidades Spring Data JDBC (@Table, @Id, @Column); son Java records
├── repository/    Interfaces que extienden ListCrudRepository<T, Integer>
├── security/      JwtAuthenticationFilter (OncePerRequestFilter)
└── service/       Lógica de negocio; los write methods son @Transactional
```

## Convención de idioma

**Código en inglés, texto visible al usuario en español.** Nombres de clases, métodos, campos, rutas URL y nombres de archivo van en inglés. Mensajes de error en respuestas HTTP van en español. `curp` y `rvoe` son acrónimos oficiales mexicanos, se conservan en minúsculas sin traducción.

## Patrones clave

### Entidades (Spring Data JDBC)
- Son **Java records** inmutables con `@Table("nombre_tabla")` e `@Id Integer id`
- Los campos con nombres compuestos llevan `@Column("nombre_columna")` explícito (ej. `@Column("is_active")`, `@Column("password_hash")`)
- Spring Data JDBC usa `save()` para insert (id=null) y update (id!=null) — no hay `persist()`
- **Los timestamps (`createdAt`, `updatedAt`) se asignan en la capa de servicio**, no por el ORM. En create se pasa `OffsetDateTime.now()` para ambos; en update solo se actualiza `updatedAt`

### Delete
- **Soft delete** por defecto: se pone `is_active = false` y se guarda el record actualizado
- No se usa `deleteById()` salvo que sea explícitamente necesario

### CORS
- Configurado en `SecurityConfig` vía bean `CorsConfigurationSource`
- Origen permitido en desarrollo: `http://localhost:4200` (Angular dev server)
- Métodos permitidos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- `allowCredentials = true` para enviar el header `Authorization` con el JWT

### Seguridad y roles
- Los roles en la DB son en minúsculas con espacios: `admin`, `rector`, `docente`, `school services manager`
- `UsuarioDetailsService` los convierte a authority con prefijo: `ROLE_ADMIN`, `ROLE_SCHOOL_SERVICES_MANAGER`
- En `SecurityConfig`, la autorización por rol usa `.hasRole("ADMIN")` (Spring añade el prefijo `ROLE_` automáticamente)
- Rutas públicas solo en `/auth/**`; el resto requiere JWT válido; recursos admin usan `.hasRole("ADMIN")` en `SecurityConfig`
- El token JWT incluye el nombre del rol original (minúsculas) como claim `rol`

### Manejo de errores
- `ResourceNotFoundException` → 404
- `IllegalArgumentException` → 400 (usado para violaciones de negocio como email duplicado)
- `BadCredentialsException` / `UsernameNotFoundException` → 401
- Todo centralizado en `GlobalExceptionHandler`; los controllers no hacen try/catch

### Respuestas
- `POST` (create) → 201 Created con body
- `DELETE` (soft delete) → 204 No Content sin body
- `GET` / `PUT` → 200 OK con body

## Base de datos

El esquema completo está en `../database/db_structure.sql`. Tablas principales:
`planteles`, `coordinadores`, `planes_estudio`, `materias`, `rvoes`, `alumnos`, `roles`, `usuarios`, `grupos`, `profesores_grupos`

Los IDs se generan con `GENERATED ALWAYS AS IDENTITY` — al hacer insert desde Java el campo `id` debe ser `null`.
