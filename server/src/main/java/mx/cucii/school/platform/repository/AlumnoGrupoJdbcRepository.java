package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.AlumnoGrupo;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class AlumnoGrupoJdbcRepository {

    private static final RowMapper<AlumnoGrupo> MAPPER = (rs, rowNum) ->
        new AlumnoGrupo(
                rs.getInt("id"),
                rs.getInt("alumno_id"),
                rs.getInt("grupo_id"),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public AlumnoGrupoJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AlumnoGrupo> findAll() {
        return jdbcTemplate.query("SELECT * FROM alumnos_grupos", MAPPER);
    }

    public List<AlumnoGrupo> findAll(int limit, int offset) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos_grupos ORDER BY id ASC LIMIT ? OFFSET ?",
                MAPPER, limit, offset
        );
    }

    public long countAll() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM alumnos_grupos", Long.class);
        return count != null ? count : 0;
    }

    public Optional<AlumnoGrupo> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos_grupos WHERE id = ?",
                MAPPER, id
        ).stream().findFirst();
    }

    public Optional<AlumnoGrupo> findByAlumnoIdAndGrupoId(Integer alumnoId, Integer grupoId) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos_grupos WHERE alumno_id = ? AND grupo_id = ?",
                MAPPER, alumnoId, grupoId
        ).stream().findFirst();
    }

    public List<AlumnoGrupo> findByAlumnoId(Integer alumnoId) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos_grupos WHERE alumno_id = ? AND is_active = true",
                MAPPER, alumnoId
        );
    }

    public List<AlumnoGrupo> findByGrupoId(Integer grupoId) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos_grupos WHERE grupo_id = ? AND is_active = true",
                MAPPER, grupoId
        );
    }

    public AlumnoGrupo save(AlumnoGrupo entity) {
        if (entity.id() == null) {
            return insert(entity);
        }
        return update(entity);
    }

    private AlumnoGrupo insert(AlumnoGrupo entity) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO alumnos_grupos (alumno_id, grupo_id, is_active, created_at)
                VALUES (?, ?, ?, ?)
                RETURNING *
                """,
                MAPPER,
                entity.alumnoId(), entity.grupoId(),
                entity.isActive(), entity.createdAt()
        );
    }

    private AlumnoGrupo update(AlumnoGrupo entity) {
        return jdbcTemplate.queryForObject(
                """
                UPDATE alumnos_grupos
                SET alumno_id = ?, grupo_id = ?
                WHERE id = ?
                RETURNING *
                """,
                MAPPER,
                entity.alumnoId(), entity.grupoId(), entity.id()
        );
    }

    public void softDeleteById(Integer id) {
        jdbcTemplate.update(
                "UPDATE alumnos_grupos SET is_active = false WHERE id = ?", id
        );
    }
}
