package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.Grupo;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class GrupoJdbcRepository {

    private static final RowMapper<Grupo> GRUPO_MAPPER = (rs, rowNum) ->
        new Grupo(
                rs.getInt("id"),
                rs.getString("clave"),
                rs.getString("nombre"),
                rs.getInt("plan_estudio_id"),
                rs.getInt("plantel_id"),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public GrupoJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Grupo> findAll() {
        return jdbcTemplate.query("SELECT * FROM grupos", GRUPO_MAPPER);
    }

    public Optional<Grupo> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM grupos WHERE id = ?",
                GRUPO_MAPPER, id
        ).stream().findFirst();
    }

    public Optional<Grupo> findByClave(String clave) {
        return jdbcTemplate.query(
                "SELECT * FROM grupos WHERE clave = ?",
                GRUPO_MAPPER, clave
        ).stream().findFirst();
    }

    public String generateNextClave() {
        Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('grupos_numero_seq')", Long.class);
        return "CG-" + nextVal;
    }

    public Grupo save(Grupo grupo) {
        if (grupo.id() == null) {
            return insert(grupo);
        }
        return update(grupo);
    }

    private Grupo insert(Grupo grupo) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO grupos (clave, nombre, plan_estudio_id, plantel_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING *
                """,
                GRUPO_MAPPER,
                grupo.clave(), grupo.nombre(), grupo.planEstudioId(),
                grupo.plantelId(),
                grupo.isActive(), grupo.createdAt(), grupo.updatedAt()
        );
    }

    private Grupo update(Grupo grupo) {
        return jdbcTemplate.queryForObject(
                """
                UPDATE grupos
                SET clave = ?, nombre = ?, plan_estudio_id = ?, plantel_id = ?, updated_at = ?
                WHERE id = ?
                RETURNING *
                """,
                GRUPO_MAPPER,
                grupo.clave(), grupo.nombre(), grupo.planEstudioId(),
                grupo.plantelId(),
                grupo.updatedAt(), grupo.id()
        );
    }

    public void softDeleteById(Integer id, OffsetDateTime now) {
        jdbcTemplate.update(
                "UPDATE grupos SET is_active = false, updated_at = ? WHERE id = ?",
                now, id
        );
    }
}
