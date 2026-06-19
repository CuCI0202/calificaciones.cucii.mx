package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.ProfesorGrupo;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class ProfesorGrupoJdbcRepository {

    private static final RowMapper<ProfesorGrupo> MAPPER = (rs, rowNum) ->
        new ProfesorGrupo(
                rs.getInt("id"),
                rs.getInt("usuario_id"),
                rs.getInt("grupo_id"),
                rs.getInt("materia_id"),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public ProfesorGrupoJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ProfesorGrupo> findAll() {
        return jdbcTemplate.query("SELECT * FROM profesores_grupos", MAPPER);
    }

    public Optional<ProfesorGrupo> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM profesores_grupos WHERE id = ?",
                MAPPER, id
        ).stream().findFirst();
    }

    public Optional<ProfesorGrupo> findByUsuarioIdAndGrupoIdAndMateriaId(
            Integer usuarioId, Integer grupoId, Integer materiaId) {
        return jdbcTemplate.query(
                "SELECT * FROM profesores_grupos WHERE usuario_id = ? AND grupo_id = ? AND materia_id = ?",
                MAPPER, usuarioId, grupoId, materiaId
        ).stream().findFirst();
    }

    public ProfesorGrupo save(ProfesorGrupo entity) {
        if (entity.id() == null) {
            return insert(entity);
        }
        return update(entity);
    }

    private ProfesorGrupo insert(ProfesorGrupo entity) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO profesores_grupos (usuario_id, grupo_id, materia_id, is_active, created_at)
                VALUES (?, ?, ?, ?, ?)
                RETURNING *
                """,
                MAPPER,
                entity.usuarioId(), entity.grupoId(), entity.materiaId(),
                entity.isActive(), entity.createdAt()
        );
    }

    private ProfesorGrupo update(ProfesorGrupo entity) {
        return jdbcTemplate.queryForObject(
                """
                UPDATE profesores_grupos
                SET usuario_id = ?, grupo_id = ?, materia_id = ?
                WHERE id = ?
                RETURNING *
                """,
                MAPPER,
                entity.usuarioId(), entity.grupoId(), entity.materiaId(), entity.id()
        );
    }

    public void softDeleteById(Integer id) {
        jdbcTemplate.update(
                "UPDATE profesores_grupos SET is_active = false WHERE id = ?", id
        );
    }
}
