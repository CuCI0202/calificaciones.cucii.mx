package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.EstatusAlumno;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public class EstatusAlumnoJdbcRepository {

    private static final RowMapper<EstatusAlumno> MAPPER = (rs, rowNum) ->
        new EstatusAlumno(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("descripcion"),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public EstatusAlumnoJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<EstatusAlumno> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM estatus_alumnos WHERE id = ?",
                MAPPER, id
        ).stream().findFirst();
    }

    public boolean existsById(Integer id) {
        return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM estatus_alumnos WHERE id = ?",
                Integer.class, id
        ) > 0;
    }
}
