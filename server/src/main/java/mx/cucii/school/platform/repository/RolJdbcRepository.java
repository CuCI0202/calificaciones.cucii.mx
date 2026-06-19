package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.Rol;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public class RolJdbcRepository {

    private static final RowMapper<Rol> ROL_MAPPER = (rs, rowNum) ->
        new Rol(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("descripcion"),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public RolJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Rol> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM roles WHERE id = ?",
                ROL_MAPPER, id
        ).stream().findFirst();
    }
}
