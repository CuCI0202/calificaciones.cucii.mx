package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.Usuario;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioJdbcRepository {

    private static final RowMapper<Usuario> USUARIO_MAPPER = (rs, rowNum) ->
        new Usuario(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("apellido"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getInt("rol_id"),
                rs.getObject("plantel_id", Integer.class),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public UsuarioJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Usuario> findAll() {
        return jdbcTemplate.query("SELECT * FROM usuarios", USUARIO_MAPPER);
    }

    public Optional<Usuario> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM usuarios WHERE id = ?",
                USUARIO_MAPPER, id
        ).stream().findFirst();
    }

    public Optional<Usuario> findByEmail(String email) {
        return jdbcTemplate.query(
                "SELECT * FROM usuarios WHERE email = ?",
                USUARIO_MAPPER, email
        ).stream().findFirst();
    }

    public Usuario save(Usuario usuario) {
        if (usuario.id() == null) {
            return insert(usuario);
        }
        return update(usuario);
    }

    private Usuario insert(Usuario usuario) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id, plantel_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING *
                """,
                USUARIO_MAPPER,
                usuario.nombre(), usuario.apellido(), usuario.email(), usuario.passwordHash(),
                usuario.rolId(), usuario.plantelId(),
                usuario.isActive(), usuario.createdAt(), usuario.updatedAt()
        );
    }

    private Usuario update(Usuario usuario) {
        return jdbcTemplate.queryForObject(
                """
                UPDATE usuarios
                SET nombre = ?, apellido = ?, email = ?, password_hash = ?, rol_id = ?,
                    plantel_id = ?, is_active = ?, updated_at = ?
                WHERE id = ?
                RETURNING *
                """,
                USUARIO_MAPPER,
                usuario.nombre(), usuario.apellido(), usuario.email(), usuario.passwordHash(),
                usuario.rolId(), usuario.plantelId(),
                usuario.isActive(), usuario.updatedAt(), usuario.id()
        );
    }

    public void softDeleteById(Integer id, OffsetDateTime now) {
        jdbcTemplate.update(
                "UPDATE usuarios SET is_active = false, updated_at = ? WHERE id = ?",
                now, id
        );
    }

    public void deleteById(Integer id) {
        jdbcTemplate.update("DELETE FROM usuarios WHERE id = ?", id);
    }
}
