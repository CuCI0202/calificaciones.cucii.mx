package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.Calificacion;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class CalificacionJdbcRepository {

    private static final RowMapper<Calificacion> MAPPER = (rs, rowNum) ->
        new Calificacion(
                rs.getInt("id"),
                rs.getInt("alumno_id"),
                rs.getInt("grupo_id"),
                rs.getInt("materia_id"),
                rs.getBigDecimal("calificacion"),
                rs.getObject("registrado_por", Integer.class),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public CalificacionJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Calificacion> findAll() {
        return jdbcTemplate.query("SELECT * FROM calificaciones", MAPPER);
    }

    public Optional<Calificacion> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM calificaciones WHERE id = ?",
                MAPPER, id
        ).stream().findFirst();
    }

    public Optional<Calificacion> findByAlumnoIdAndGrupoIdAndMateriaId(
            Integer alumnoId, Integer grupoId, Integer materiaId) {
        return jdbcTemplate.query(
                "SELECT * FROM calificaciones WHERE alumno_id = ? AND grupo_id = ? AND materia_id = ?",
                MAPPER, alumnoId, grupoId, materiaId
        ).stream().findFirst();
    }

    public Calificacion save(Calificacion entity) {
        if (entity.id() == null) {
            return insert(entity);
        }
        return update(entity);
    }

    private Calificacion insert(Calificacion entity) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO calificaciones (alumno_id, grupo_id, materia_id, calificacion, registrado_por, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING *
                """,
                MAPPER,
                entity.alumnoId(), entity.grupoId(), entity.materiaId(),
                entity.calificacion(), entity.registradoPor(),
                entity.isActive(), entity.createdAt(), entity.updatedAt()
        );
    }

    private Calificacion update(Calificacion entity) {
        return jdbcTemplate.queryForObject(
                """
                UPDATE calificaciones
                SET alumno_id = ?, grupo_id = ?, materia_id = ?, calificacion = ?,
                    registrado_por = ?, updated_at = ?
                WHERE id = ?
                RETURNING *
                """,
                MAPPER,
                entity.alumnoId(), entity.grupoId(), entity.materiaId(),
                entity.calificacion(), entity.registradoPor(),
                entity.updatedAt(), entity.id()
        );
    }

    public void softDeleteById(Integer id, OffsetDateTime now) {
        jdbcTemplate.update(
                "UPDATE calificaciones SET is_active = false, updated_at = ? WHERE id = ?",
                now, id
        );
    }
}
